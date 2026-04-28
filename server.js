(function () {

const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   LOCAL DB
========================= */
const DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),
  saveTickets: (data) => localStorage.setItem("tickets", JSON.stringify(data)),
  getActiveSpk: () => localStorage.getItem("activeTicketId")
};

/* =========================
   GET ACTIVE TICKET
========================= */
function getActiveTicket(){
  return DB.getTickets().find(t => t.spk == DB.getActiveSpk());
}

/* =========================
   SYNC MATERIAL → TICKET
   (ONLY QTY > 0)
========================= */
window.syncMaterialToTicket = function(materials){

  let tickets = DB.getTickets();
  let spk = DB.getActiveSpk();

  let t = tickets.find(x => x.spk == spk);
  if(!t) return;

  t.material = (materials || [])
    .filter(m => Number(m.qty) > 0);

  DB.saveTickets(tickets);
};

/* =========================
   SAVE TICKET FULL
========================= */
async function pushToServer(){

  let tickets = DB.getTickets();

  try{
    await fetch(SERVER_URL + "/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "LMS",
        data: tickets
      })
    });
  } catch(e){
    console.log("SYNC ERROR", e);
  }
}

/* =========================
   LOAD FROM SERVER
========================= */
async function pullFromServer(){

  try{
    let res = await fetch(SERVER_URL + "/api/get?type=LMS");
    let data = await res.json();

    if(Array.isArray(data)){
      DB.saveTickets(data);
    }

  } catch(e){
    console.log("LOAD ERROR", e);
  }
}

/* =========================
   AUTO INIT
========================= */
(async function(){
  await pullFromServer();
})();

/* =========================
   AUTO SYNC
========================= */
setInterval(pushToServer, 30000);

window.addEventListener("beforeunload", pushToServer);

/* =========================
   GLOBAL API
========================= */
window.FS = {
  DB,
  pushToServer,
  pullFromServer,
  syncMaterialToTicket
};

})();
