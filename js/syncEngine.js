(function () {

const SERVER_URL =
window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   TOAST
========================= */
function showToast(msg, type = "success") {

  let toast = document.createElement("div");
  toast.textContent = msg;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "10px";
  toast.style.color = "#fff";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "99999";
  toast.style.boxShadow = "0 8px 20px rgba(0,0,0,.18)";
  toast.style.transition = "0.3s";

  if(type === "success") toast.style.background = "#28a745";
  else if(type === "error") toast.style.background = "#dc3545";
  else toast.style.background = "#333";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* =========================
   LOCAL CACHE
========================= */
const DB = {

  getTickets(){
    return JSON.parse(localStorage.getItem("tickets") || "[]");
  },

  saveTickets(data){
    localStorage.setItem("tickets", JSON.stringify(data));
  },

  getActiveSpk(){
    return localStorage.getItem("activeTicketId");
  }

};

/* =========================
   ACTIVE TICKET
========================= */
function getActiveTicket(){

  let id = DB.getActiveSpk();
  if(!id) return null;

  let tickets = DB.getTickets();
  return tickets.find(x => x.id == id) || null;
}

/* =========================
   CLEAN DATA
========================= */
function cleanBeforeSave(tickets){

  return tickets.map(t => {

    let x = { ...t };

    if(Array.isArray(x.material)){
      x.material = x.material
        .filter(m => Number(m.qty) > 0)
        .map(m => ({
          nama: m.nama || "",
          satuan: m.satuan || "",
          harga: Number(m.harga || 0),
          qty: Number(m.qty || 0)
        }));
    }

    return x;
  });
}

/* =========================
   LOAD SERVER (SOURCE OF TRUTH)
========================= */
async function loadAll(){

  try{

    let res = await fetch(SERVER_URL + "/api/get?type=LMS&_=" + Date.now());

    if(!res.ok){
      showToast("❌ Gagal ambil data server", "error");
      return [];
    }

    let data = await res.json();

    if(!Array.isArray(data)){
      showToast("❌ Data server rusak", "error");
      return [];
    }

    DB.saveTickets(data);

    window.dispatchEvent(new CustomEvent("ticketsUpdated", {
      detail: data
    }));

    return data;

  }catch(err){
    console.log(err);
    showToast("❌ Load gagal", "error");
    return [];
  }
}

/* =========================
   SAVE SERVER
========================= */
async function saveAll(){

  try{

    let tickets = DB.getTickets();
    let cleaned = cleanBeforeSave(tickets);

    let res = await fetch(SERVER_URL + "/api/save", {
      method: "POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        type: "LMS",
        data: cleaned
      })
    });

    if(!res.ok){
      showToast("❌ Gagal save server", "error");
      return;
    }

    await loadAll();

    showToast("✔ Data berhasil disimpan", "success");

  }catch(err){
    console.log(err);
    showToast("❌ Save gagal", "error");
  }
}

/* =========================
   REFRESH
========================= */
async function refreshNow(){
  await loadAll();
  showToast("✔ Data berhasil di refresh", "success");
}

/* =========================
   GLOBAL EXPORT
========================= */
window.saveNow = saveAll;
window.loadNow = refreshNow;

window.FS = {
  DB,
  getActiveTicket,
  saveAll,
  loadAll
};

/* =========================
   EXPOSE GLOBAL (WAJIB)
========================= */
window.DB = DB;
window.SERVER_URL = SERVER_URL;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadAll();
});

})();
