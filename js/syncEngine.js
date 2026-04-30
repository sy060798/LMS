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
   LOCAL DB (SOURCE OF TRUTH)
========================= */
const DB = {

  getTickets(){
    return JSON.parse(localStorage.getItem("tickets") || "[]");
  },

  saveTickets(data){
    localStorage.setItem("tickets", JSON.stringify(data));
  },

  update(mutator){

    let data = this.getTickets();
    data = mutator(data);
    this.saveTickets(data);

    return data;
  }

};

/* =========================
   LOCK SYSTEM (ANTI DOUBLE SYNC)
========================= */
let isSyncing = false;

/* =========================
   LOAD FROM SERVER
========================= */
async function loadAll(){

  if(isSyncing) return;

  try{

    isSyncing = true;

    const res = await fetch(`${SERVER_URL}/api/get?type=LMS&_=${Date.now()}`);

    if(!res.ok) return [];

    const data = await res.json();

    if(!Array.isArray(data)) return [];

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
   SAVE SERVER
========================= */
async function saveAll(){

  try{

    const data = DB.getTickets();

    await fetch(`${SERVER_URL}/api/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "LMS",
        data
      })
    });

    await loadAll();

  }catch(err){
    console.log("SAVE ERROR:", err);
    showToast("❌ Save gagal", "error");
  }
}

/* =========================
   UPDATE SINGLE TICKET (ANTI BENTROK CORE)
========================= */
function updateTicket(id, callback){

  DB.update(data => {

    const i = data.findIndex(t => t.id === id);

    if(i !== -1){
      data[i] = callback(data[i]);
    }

    return data;
  });
}

/* =========================
   DELETE SAFE (FIX BALIK DATA)
========================= */
function deleteTicket(id){

  DB.update(data => data.filter(t => t.id !== id));
}

/* =========================
   MATERIAL UPDATE SAFE
========================= */
function updateMaterial(id, material){

  updateTicket(id, t => {
    t.material = material;
    return t;
  });
}

/* =========================
   NOTE UPDATE SAFE
========================= */
function updateNote(id, note){

  updateTicket(id, t => {
    t.note = note;
    return t;
  });
}

/* =========================
   STATUS UPDATE SAFE
========================= */
function updateStatus(id, status){

  updateTicket(id, t => {
    t.status = status;
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
  updateMaterial,
  updateNote,
  updateStatus,

  get isSyncing(){
    return isSyncing;
  }
};

/* =========================
   GLOBAL EXPOSE (OPTIONAL LEGACY)
========================= */
window.DB = DB;
window.SERVER_URL = SERVER_URL;

/* =========================
   AUTO LOAD
========================= */
document.addEventListener("DOMContentLoaded", loadAll);

})();
