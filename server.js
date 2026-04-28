/* =========================================
   SERVER.JS - FS TICKET SYSTEM (FINAL FIX)
========================================= */

if (typeof SERVER_URL === "undefined") {
  var SERVER_URL = "https://tracking-server-production-6a12.up.railway.app";
}

/* ===============================
   AUTH
=============================== */
function getAuth(){
  return JSON.parse(localStorage.getItem("auth") || "null");
}

/* ===============================
   LOADING UI
=============================== */
function showLoading(txt = "Loading...") {
  hideLoading();

  let box = document.createElement("div");
  box.id = "miniLoading";

  box.innerHTML = `
    <div class="loading-box">
      <div class="spin"></div>
      <div class="load-text">${txt}</div>
      <div class="bar-wrap">
        <div class="bar-run"></div>
      </div>
    </div>
  `;

  document.body.appendChild(box);
}

function hideLoading(){
  let x = document.getElementById("miniLoading");
  if(x) x.remove();
}

/* ===============================
   SERVER CHECK
=============================== */
async function cekServer(){
  try{
    await fetch(SERVER_URL + "/");
  }catch(e){
    console.log("SERVER OFFLINE");
  }
}

/* ===============================
   LOAD ALL DATA
=============================== */
async function loadAllData(){
  try{

    showLoading("Sync Data...");

    let tickets = await fetch(SERVER_URL + "/tickets").then(r=>r.json()).catch(()=>[]);
    let material = await fetch(SERVER_URL + "/material").then(r=>r.json()).catch(()=>[]);

    if(Array.isArray(tickets)){
      localStorage.setItem("tickets", JSON.stringify(tickets));
    }

    if(Array.isArray(material)){
      localStorage.setItem("materialMaster", JSON.stringify(material));
    }

    hideLoading();

  }catch(e){
    hideLoading();
    console.log(e);
  }
}

/* ===============================
   ACTIVE TICKET
=============================== */
function getActiveTicketId(){
  return localStorage.getItem("activeTicketId");
}

/* ===============================
   🔥 SYNC MATERIAL → ACTIVE TICKET
=============================== */
function syncMaterialToActiveTicket(){

  let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
  let activeId = getActiveTicketId();

  if(!activeId) return;

  let ticket = tickets.find(t => t.id == activeId);
  if(!ticket) return;

  let materials = JSON.parse(localStorage.getItem("materialMaster") || "[]");

  // ONLY QTY > 0
  ticket.material = materials.filter(m => Number(m.qty) > 0);

  localStorage.setItem("tickets", JSON.stringify(tickets));
}

/* ===============================
   SAVE LOCAL (ANTI LOSS)
=============================== */
function saveLocal(){
  syncMaterialToActiveTicket();
}

/* ===============================
   UPLOAD TICKETS
=============================== */
async function uploadTickets(){

  let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

  try{
    await fetch(SERVER_URL + "/saveTickets",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({tickets})
    });
  }catch(e){
    console.log(e);
  }
}

/* ===============================
   UPLOAD MATERIAL PER TICKET
=============================== */
async function uploadMaterial(){

  const auth = getAuth();
  if(!auth || !auth.token) return;

  let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
  let activeId = getActiveTicketId();

  if(!activeId) return;

  let ticket = tickets.find(t => t.id == activeId);
  if(!ticket) return;

  try{
    await fetch(SERVER_URL + "/saveMaterial",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer " + auth.token
      },
      body:JSON.stringify({
        ticketId: activeId,
        material: ticket.material || []
      })
    });
  }catch(e){
    console.log(e);
  }
}

/* ===============================
   AUTO START
=============================== */
(async function(){
  await cekServer();
  await loadAllData();
})();

/* ===============================
   AUTO SYNC
=============================== */
setInterval(() => {
  saveLocal();
  uploadTickets();
  uploadMaterial();
}, 30000);

/* ===============================
   BEFORE CLOSE
=============================== */
window.addEventListener("beforeunload", function(){
  saveLocal();
  uploadTickets();
  uploadMaterial();
});

/* ===============================
   GLOBAL HOOK
=============================== */
window.syncMaterialToActiveTicket = syncMaterialToActiveTicket;

/* ===============================
   SAVE BUTTON FIXED
=============================== */
window.saveNow = function(){
  saveLocal();          // <- penting
  uploadTickets();
  uploadMaterial();
  alert("Data berhasil sync ke server");
};
