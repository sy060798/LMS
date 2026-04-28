(function () {

/* =========================
   SERVER
========================= */
const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   LOCAL HELPERS
========================= */
const DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),
  saveTickets: (data) => localStorage.setItem("tickets", JSON.stringify(data)),

  getActiveId: () => localStorage.getItem("activeTicketId")
};

/* =========================
   SYNC MATERIAL KE TICKET
   (CORE LOGIC)
========================= */
function syncMaterial(materials){

  let tickets = DB.getTickets();
  let id = DB.getActiveId();

  let ticket = tickets.find(t => t.id == id);
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
   PUSH KE SERVER (TICKETS + MATERIAL)
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
   LOAD SERVER DATA
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
   AUTO INIT
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
   BEFORE CLOSE SAVE
========================= */
window.addEventListener("beforeunload", function(){
  pushToServer();
});

/* =========================
   EXPOSE GLOBAL
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
