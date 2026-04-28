(function () {

/* =========================
   SERVER
========================= */
const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   DB HELPER
========================= */
const DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),
  saveTickets: (data) => localStorage.setItem("tickets", JSON.stringify(data)),

  getActiveId: () => localStorage.getItem("activeTicketId")
};

/* =========================
   SYNC MATERIAL → TICKET (SPK BASED)
========================= */
function syncMaterial(materials){

  let tickets = DB.getTickets();
  let spk = DB.getActiveId();

  let ticket = tickets.find(t => t.spk == spk);
  if(!ticket) return;

  ticket.material = (materials || []).filter(m => Number(m.qty) > 0);

  DB.saveTickets(tickets);
}

/* =========================
   SAVE LOCAL
========================= */
function saveLocal(materials){
  syncMaterial(materials);
}

/* =========================
   PUSH SERVER
========================= */
async function pushToServer(){

  try{
    await fetch(SERVER_URL + "/syncTickets",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        tickets: DB.getTickets()
      })
    });
  }catch(e){
    console.log("SYNC FAIL", e);
  }

}

/* =========================
   PULL SERVER
========================= */
async function pullFromServer(){

  try{
    let res = await fetch(SERVER_URL + "/tickets");
    let data = await res.json();

    if(Array.isArray(data)){
      DB.saveTickets(data);
    }

  }catch(e){
    console.log("LOAD FAIL", e);
  }

}

/* =========================
   INIT
========================= */
(async function(){
  await pullFromServer();
})();

/* =========================
   AUTO SYNC
========================= */
setInterval(() => {
  pushToServer();
}, 30000);

/* =========================
   CLOSE SAVE
========================= */
window.addEventListener("beforeunload", function(){
  pushToServer();
});

/* =========================
   GLOBAL API
========================= */
window.FS = {
  syncMaterial,
  saveLocal,
  pushToServer,
  pullFromServer,
  getTickets: DB.getTickets,
  getActiveId: DB.getActiveId
};

})();
