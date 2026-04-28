(function () {

/* =========================
   GET ALL DATA
========================= */
window.DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),

  saveTickets: (data) =>
    localStorage.setItem("tickets", JSON.stringify(data)),

  getActiveTicket: () => {
    let id = localStorage.getItem("activeTicketId");
    return DB.getTickets().find(t => t.id == id);
  }
};

/* =========================
   SYNC MATERIAL KE TICKET
========================= */
window.syncMaterialToTicket = function(materials){

  let tickets = DB.getTickets();
  let activeId = localStorage.getItem("activeTicketId");

  let t = tickets.find(x => x.id == activeId);
  if(!t) return;

  t.material = materials.filter(m => Number(m.qty) > 0);

  DB.saveTickets(tickets);
};

/* =========================
   GET MATERIAL PER TICKET
========================= */
window.getMaterialByTicket = function(ticketId){

  let t = DB.getTickets().find(x => x.id == ticketId);

  return t?.material || [];

};

/* =========================
   UPDATE SINGLE TICKET
========================= */
window.updateTicket = function(ticket){

  let tickets = DB.getTickets();

  let i = tickets.findIndex(t => t.id == ticket.id);
  if(i >= 0){
    tickets[i] = ticket;
    DB.saveTickets(tickets);
  }

};

})();
