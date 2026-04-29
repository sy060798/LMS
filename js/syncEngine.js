(function () {

const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   TOAST NOTIFICATION
========================= */
function showToast(msg, type = "success") {

  let toast = document.createElement("div");

  toast.textContent = msg;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "8px";
  toast.style.color = "#fff";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
  toast.style.transition = "0.3s ease";

  if (type === "success") {
    toast.style.background = "#28a745";
  } else if (type === "error") {
    toast.style.background = "#dc3545";
  } else {
    toast.style.background = "#333";
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* =========================
   LOCAL DB
========================= */
const DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),

  saveTickets: (data) => {
    localStorage.setItem("tickets", JSON.stringify(data));
  },

  getActiveSpk: () => localStorage.getItem("activeTicketId")
};

/* =========================
   GET ACTIVE
========================= */
function getActiveTicket(){
  const id = DB.getActiveSpk();
  if(!id) return null;
  return DB.getTickets().find(t => t.id == id);
}

/* =========================
   CLEAN BEFORE SAVE
========================= */
function cleanBeforeSave(tickets){

  return tickets.map(t => {

    let copy = { ...t };

    if(Array.isArray(copy.material)){
      copy.material = copy.material
        .filter(m => Number(m.qty) > 0)
        .map(m => ({
          nama: m.nama,
          satuan: m.satuan,
          harga: Number(m.harga || 0),
          qty: Number(m.qty || 0)
        }));
    }

    return copy;
  });

}

/* =========================
   SAVE ALL (SERVER SYNC)
========================= */
async function saveAll(){

  try {

    let tickets = DB.getTickets();
    let cleaned = cleanBeforeSave(tickets);

    DB.saveTickets(cleaned);

    let res = await fetch(SERVER_URL + "/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "LMS",
        data: cleaned
      })
    });

    if(!res.ok){
      showToast("❌ Server error saat save", "error");
      return;
    }

    window.dispatchEvent(new Event("ticketsUpdated"));

    showToast("✔ Data berhasil disimpan", "success");
    console.log("✔ SAVE OK");

  } catch (e) {
    showToast("❌ Gagal sync data", "error");
    console.log("SAVE ERROR", e);
  }
}

/* =========================
   LOAD ALL (MERGE SERVER + LOCAL)
========================= */
async function loadAll(){

  try {

    let res = await fetch(SERVER_URL + "/api/get?type=LMS");

    if(!res.ok){
      showToast("❌ Gagal load server data", "error");
      return;
    }

    let serverData = await res.json();

    if(!Array.isArray(serverData)) return;

    let localData = DB.getTickets();

    let map = new Map();

    // LOCAL PRIORITY
    localData.forEach(t => map.set(t.id, t));

    // SERVER FILL
    serverData.forEach(t => {
      if(!map.has(t.id)){
        map.set(t.id, t);
      }
    });

    let merged = Array.from(map.values());

    DB.saveTickets(merged);

    window.dispatchEvent(new Event("ticketsUpdated"));

    showToast("✔ Data sync berhasil", "success");
    console.log("✔ LOAD MERGED OK");

  } catch (e) {
    showToast("❌ Load gagal", "error");
    console.log("LOAD ERROR", e);
  }
}

/* =========================
   MANUAL TRIGGER
========================= */
window.saveNow = saveAll;
window.loadNow = loadAll;

/* =========================
   GLOBAL API
========================= */
window.FS = {
  DB,
  saveAll,
  loadAll
};

/* =========================
   AUTO LOAD SAAT BUKA WEB
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if(window.FS && FS.loadAll){
    FS.loadAll();
  }
});

/* =========================
   AUTO SYNC SAAT ADA PERUBAHAN
========================= */
window.addEventListener("ticketsUpdated", () => {
  if(window.FS && FS.saveAll){
    FS.saveAll();
  }
});

})();
