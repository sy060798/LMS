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
   ACTIVE
========================= */
function getActiveTicket(){

  let id = DB.getActiveSpk();
  if(!id) return null;

  return DB.getTickets().find(x => x.id == id) || null;
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
   LOAD SERVER (MASTER)
========================= */
async function loadAll(){

  try{

    let res = await fetch(SERVER_URL + "/api/get?type=LMS&_=" + Date.now());

    if(!res.ok){
      showToast("❌ Gagal ambil data server", "error");
      return false;
    }

    let serverData = await res.json();

    if(!Array.isArray(serverData)){
      showToast("❌ Data server rusak", "error");
      return false;
    }

    DB.saveTickets(serverData);

    window.dispatchEvent(new Event("ticketsUpdated"));

    console.log("LOAD OK");
    return true;

  }catch(err){

    console.log(err);
    showToast("❌ Load gagal", "error");
    return false;
  }
}

/* =========================
   SAVE SERVER (MASTER)
   selalu ambil server dulu
========================= */
async function saveAll(){

  try{

    /* ambil terbaru dulu */
    let ok = await loadAll();
    if(!ok) return;

    /* ambil local setelah update */
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

    DB.saveTickets(cleaned);

    window.dispatchEvent(new Event("ticketsUpdated"));

    showToast("✔ Data berhasil disimpan", "success");
    console.log("SAVE OK");

  }catch(err){

    console.log(err);
    showToast("❌ Save gagal", "error");
  }
}

/* =========================
   REFRESH BUTTON
========================= */
async function refreshNow(){

  let ok = await loadAll();

  if(ok){
    showToast("✔ Data berhasil di refresh", "success");
  }
}

/* =========================
   BUTTON MANUAL
========================= */
window.saveNow = saveAll;
window.loadNow = refreshNow;

/* =========================
   GLOBAL
========================= */
window.FS = {
  DB,
  getActiveTicket,
  saveAll,
  loadAll: refreshNow
};

/* =========================
   MANUAL MODE
=========================
Server = pusat data utama
Klik Save    = ambil server lalu save server
Klik Refresh = ambil server
100 Chrome refresh = sama semua
========================= */

})();
