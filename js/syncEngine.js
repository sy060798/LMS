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
   LOCAL DB (CACHE ONLY)
========================= */
const DB = {

  getTickets(){
    return JSON.parse(localStorage.getItem("tickets") || "[]");
  },

  saveTickets(data){
    localStorage.setItem("tickets", JSON.stringify(data));
  }

};

/* =========================
   STATE CONTROL
========================= */
let isSyncing = false;
let saveTimer = null;
let autoRefreshTimer = null;

/* =========================
   LOAD FROM SERVER
========================= */
async function loadAll(){

  if(isSyncing) return;

  isSyncing = true;

  try{

    const res = await fetch(`${SERVER_URL}/tickets`);
    const data = await res.json();

    if(!Array.isArray(data)){
      console.log("DATA INVALID");
      return [];
    }

    DB.saveTickets(data);

    window.dispatchEvent(new CustomEvent("ticketsUpdated", {
      detail: data
    }));

    return data;

  }catch(err){
    console.log("LOAD ERROR:", err);
    return [];
  }finally{
    isSyncing = false;
  }
}

/* =========================
   AUTO REFRESH 10 MENIT
========================= */
function startAutoRefresh(){

  if(autoRefreshTimer) clearInterval(autoRefreshTimer);

  autoRefreshTimer = setInterval(() => {
    loadAll();
  }, 10 * 60 * 1000);

}

/* =========================
   FORCE BACK DASHBOARD
========================= */
function forceToDashboard(){

  sessionStorage.setItem("forceDashboard", "1");
  window.location.href = "../index.html";

}

/* =========================
   SAVE (DEBOUNCE SAFE)
========================= */
function saveAll(){

  clearTimeout(saveTimer);

  saveTimer = setTimeout(async () => {

    try{

      const data = DB.getTickets();

      await fetch(`${SERVER_URL}/tickets/bulk-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      await loadAll();

    }catch(err){
      console.log("SAVE ERROR:", err);
      showToast("❌ Save gagal", "error");
    }

  }, 500);

}

/* =========================
   UPDATE TICKET
========================= */
function updateTicket(id, callback){

  let data = DB.getTickets();

  let index = data.findIndex(t => t.id === id);

  if(index === -1) return;

  data[index] = callback({ ...data[index] });

  DB.saveTickets(data);

  saveAll();
}

/* =========================
   DELETE
========================= */
function deleteTicket(id){

  let data = DB.getTickets();

  data = data.filter(t => t.id !== id);

  DB.saveTickets(data);

  saveAll();
}

/* =========================
   HELPERS
========================= */
function updateNote(id, note){
  updateTicket(id, t => {
    t.note = note;
    return t;
  });
}

function updateStatus(id, status){
  updateTicket(id, t => {
    t.status = status;
    return t;
  });
}

function updateMaterial(id, material){
  updateTicket(id, t => {
    t.material = material;
    return t;
  });
}

/* =========================
   PUBLIC API
========================= */
window.syncEngine = {

  DB,

  loadAll,
  saveAll,

  updateTicket,
  deleteTicket,
  updateNote,
  updateStatus,
  updateMaterial,

  startAutoRefresh,
  forceToDashboard,

  get isSyncing(){
    return isSyncing;
  }
};

/* =========================
   GLOBAL EXPORT
========================= */
window.DB = DB;
window.SERVER_URL = SERVER_URL;

/* =========================
   AUTO LOAD + AUTO START
========================= */
document.addEventListener("DOMContentLoaded", function () {

  loadAll();
  startAutoRefresh();

});

})();
