(function () {

/* =========================
   SERVER URL
========================= */
const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   LOCAL STORAGE CORE
========================= */
window.SYNC = {

  /* GET TICKETS */
  getTickets: () =>
    JSON.parse(localStorage.getItem("tickets") || "[]"),

  /* SAVE + PUSH SERVER */
  saveTickets: (data) => {
    localStorage.setItem("tickets", JSON.stringify(data));
    SYNC.pushToServer(data);
  },

  /* ACTIVE TICKET (ID / SPK FLEXIBLE) */
  getActiveTicket: () => {
    let id = localStorage.getItem("activeTicketId");
    return SYNC.getTickets().find(t => t.id == id || t.spk == id);
  },

/* =========================
   PUSH KE SERVER LMS
========================= */
  pushToServer: async (data) => {
    try {
      await fetch(SERVER_URL + "/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "LMS",
          data: data
        })
      });
    } catch (e) {
      console.log("SYNC PUSH ERROR:", e);
    }
  },

/* =========================
   PULL DARI SERVER LMS
========================= */
  pullFromServer: async () => {
    try {
      let res = await fetch(SERVER_URL + "/api/get?type=LMS");
      let data = await res.json();

      if (Array.isArray(data)) {
        localStorage.setItem("tickets", JSON.stringify(data));
      }

      return data;
    } catch (e) {
      console.log("SYNC LOAD ERROR:", e);
      return SYNC.getTickets();
    }
  }

};

/* =========================
   MATERIAL SYNC (ONLY QTY > 0)
========================= */
window.syncMaterialToTicket = function(materials){

  let tickets = SYNC.getTickets();
  let id = localStorage.getItem("activeTicketId");

  let t = tickets.find(x => x.id == id || x.spk == id);
  if(!t) return;

  t.material = (materials || []).filter(m => Number(m.qty) > 0);

  SYNC.saveTickets(tickets);
};

/* =========================
   UPDATE SINGLE TICKET
========================= */
window.updateTicket = function(ticket){

  let tickets = SYNC.getTickets();

  let i = tickets.findIndex(t =>
    t.id == ticket.id || t.spk == ticket.spk
  );

  if(i >= 0){
    tickets[i] = ticket;
    SYNC.saveTickets(tickets);
  }

};

/* =========================
   INIT AUTO LOAD
========================= */
(async function initSync(){
  await SYNC.pullFromServer();
  console.log("🚀 SYNC ENGINE READY (LMS)");
})();

/* =========================
   AUTO SYNC LOOP
========================= */
setInterval(() => {
  SYNC.pullFromServer();
}, 30000);

/* =========================
   BEFORE CLOSE SAVE
========================= */
window.addEventListener("beforeunload", function(){
  SYNC.saveTickets(SYNC.getTickets());
});

})();
