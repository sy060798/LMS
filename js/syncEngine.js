(function () {

const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   LOCAL DB
========================= */
const DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),

  saveTicketsLocal: (data) => {
    localStorage.setItem("tickets", JSON.stringify(data));
  },

  getActiveSpk: () => localStorage.getItem("activeTicketId")
};

/* =========================
   GET ACTIVE TICKET
========================= */
function getActiveTicket(){
  return DB.getTickets().find(t => t.spk == DB.getActiveSpk());
}

/* =========================
   CLEAN MATERIAL (ONLY QTY > 0)
========================= */
function cleanTickets(tickets){

  return tickets.map(t => {

    if(t.material && Array.isArray(t.material)){
      t.material = t.material.filter(m => Number(m.qty) > 0);
    }

    return t;
  });

}

/* =========================
   🔥 MAIN SAVE ALL (ONE BUTTON)
========================= */
async function saveAll(){

  try {

    let tickets = DB.getTickets();

    // cleanup material
    tickets = cleanTickets(tickets);

    // save local first
    DB.saveTicketsLocal(tickets);

    // push server
    await fetch(SERVER_URL + "/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "LMS",
        data: tickets
      })
    });

    alert("✔ Semua data berhasil disimpan");

  } catch (e) {
    console.log("SAVE ERROR", e);
    alert("❌ Gagal save ke server");
  }

}

/* =========================
   LOAD SERVER
========================= */
async function loadAll(){

  try {

    let res = await fetch(SERVER_URL + "/api/get?type=LMS");
    let data = await res.json();

    if(Array.isArray(data)){
      DB.saveTicketsLocal(data);
    }

  } catch (e) {
    console.log("LOAD ERROR", e);
  }

}

/* =========================
   INIT
========================= */
(async function(){
  await loadAll();
})();

/* =========================
   EXPOSE GLOBAL
========================= */
window.SAVE_ALL = saveAll;

})();
