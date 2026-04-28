(function () {

/* =========================
   SERVER URL
========================= */
const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   DB CORE
========================= */
window.DB = {

  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),

  saveTickets: (data) => {
    localStorage.setItem("tickets", JSON.stringify(data));
    DB.pushToServer(data);
  },

  /* 🔥 FIX: pakai SPK */
  getActiveTicket: () => {
    let spk = localStorage.getItem("activeTicketId");
    return DB.getTickets().find(t => t.spk == spk);
  },

  /* =========================
     PUSH SERVER
  ========================= */
  pushToServer: async (data) => {
    try {
      await fetch(SERVER_URL + "/syncTickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: data })
      });
    } catch (e) {
      console.log("SYNC FAIL:", e);
    }
  },

  /* =========================
     PULL SERVER
  ========================= */
  pullFromServer: async () => {
    try {
      let res = await fetch(SERVER_URL + "/tickets");
      let data = await res.json();

      if (Array.isArray(data)) {
        localStorage.setItem("tickets", JSON.stringify(data));
      }

      return data;
    } catch (e) {
      console.log("LOAD FAIL:", e);
      return DB.getTickets();
    }
  }
};

/* =========================
   SYNC MATERIAL → TICKET
========================= */
window.syncMaterialToTicket = function(materials){

  let tickets = DB.getTickets();
  let spk = localStorage.getItem("activeTicketId");

  let t = tickets.find(x => x.spk == spk);
  if(!t) return;

  t.material = (materials || []).filter(m => Number(m.qty) > 0);

  DB.saveTickets(tickets);
};

/* =========================
   GET MATERIAL PER TICKET
========================= */
window.getMaterialByTicket = function(spk){

  let t = DB.getTickets().find(x => x.spk == spk);
  return t?.material || [];

};

/* =========================
   UPDATE TICKET
========================= */
window.updateTicket = function(ticket){

  let tickets = DB.getTickets();

  let i = tickets.findIndex(t => t.spk == ticket.spk);
  if(i >= 0){
    tickets[i] = ticket;
    DB.saveTickets(tickets);
  }

};

/* =========================
   AUTO INIT
========================= */
(async function initSync(){
  await DB.pullFromServer();
  console.log("SYNC DONE");
})();

/* =========================
   AUTO REFRESH SERVER
========================= */
setInterval(() => {
  DB.pullFromServer();
}, 30000);

})();
