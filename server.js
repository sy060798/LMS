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
   MASTER SYNC (ANTI BEDA CHROME)
=============================== */
async function loadAllData(){

  try{

    showLoading("Sync Data...");

    let tickets = await fetch(SERVER_URL+"/tickets").then(r=>r.json());
    let material = await fetch(SERVER_URL+"/material").then(r=>r.json());

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
   🔥 CORE: SYNC MATERIAL → TICKET
=============================== */
function syncMaterialToActiveTicket(){

  let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
  let activeId = getActiveTicketId();

  if(!activeId) return;

  let ticket = tickets.find(t => t.id == activeId);
  if(!ticket) return;

  let materials = JSON.parse(localStorage.getItem("materialMaster") || "[]");

  ticket.material = materials;

  localStorage.setItem("tickets", JSON.stringify(tickets));
}

/* ===============================
   SAVE TICKETS TO SERVER
=============================== */
async function uploadTickets(){

  let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

  try{

    await fetch(SERVER_URL+"/saveTickets",{
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
   SAVE MATERIAL PER TICKET
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

    await fetch(SERVER_URL+"/saveMaterial",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer "+auth.token
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
   AUTO SYNC REALTIME
=============================== */
setInterval(() => {

  uploadTickets();
  uploadMaterial();

}, 30000);

/* ===============================
   IMPORTANT: AUTO SYNC TRIGGER HOOK
   (INI YANG BIKIN PER TICKET AMAN)
=============================== */
window.syncMaterialToActiveTicket = syncMaterialToActiveTicket;
