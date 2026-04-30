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
   LOCAL CACHE (HANYA CACHE)
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

    // cache lokal saja
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
   SAVE SERVER (FIXED - NO LOAD BEFORE SAVE)
========================= */
async function saveAll(){

  try{

    // ambil dari cache lokal (biar cepat)
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

    // refresh dari server setelah save
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
   BUTTON GLOBAL
========================= */
window.saveNow = saveAll;
window.loadNow = refreshNow;

/* =========================
   GLOBAL API
========================= */
window.FS = {
  DB,
  getActiveTicket,
  saveAll,
  loadAll
};

/* =========================
   AUTO LOAD SAAT BUKA
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadAll();
});

})();


/* =========================
   AUTO LOAD SAAT BUKA
========================= */

(function forceDeleteByCode(){

  // 🔥 GANTI INI KODE SPK YANG MAU DIHAPUS
  const DELETE_SPK_ID = " "; // <-- ubah ini

  async function run(){

    try{

      let tickets = DB.getTickets();

      let filtered = tickets.filter(t => t.id != DELETE_SPK_ID);

      if(filtered.length === tickets.length){
        console.log("SPK tidak ditemukan:", DELETE_SPK_ID);
        return;
      }

      let res = await fetch(SERVER_URL + "/api/save", {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          type: "LMS",
          data: filtered
        })
      });

      if(!res.ok){
        console.log("Gagal hapus di server");
        return;
      }

      DB.saveTickets(filtered);

      console.log("SPK berhasil dihapus:", DELETE_SPK_ID);

      await loadAll();

    }catch(err){
      console.log("ERROR DELETE:", err);
    }
  }

  run();

})();
