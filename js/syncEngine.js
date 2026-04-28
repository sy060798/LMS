(function () {

const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   LOCAL DB
========================= */
const DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),

  saveTickets: (data) => {
    localStorage.setItem("tickets", JSON.stringify(data));
  },

  getActiveSpk: () => localStorage.getItem("activeTicketId")
};

/* =========================
   GET ACTIVE
========================= */
function getActiveTicket(){
  return DB.getTickets().find(t => t.id == DB.getActiveSpk());
}

/* =========================
   CLEAN ONLY BEFORE SAVE
========================= */
function cleanBeforeSave(tickets){

  return tickets.map(t => {

    if(Array.isArray(t.material)){
      t.material = t.material
        .filter(m => Number(m.qty) > 0)
        .map(m => ({
          nama: m.nama,
          satuan: m.satuan,
          harga: Number(m.harga || 0),
          qty: Number(m.qty || 0)
        }));
    }

    return t;
  });

}

/* =========================
   SAVE ALL
========================= */
async function saveAll(){

  try {

    let tickets = DB.getTickets();

    // ONLY CLEAN BEFORE SAVE
    let cleaned = cleanBeforeSave(tickets);

    DB.saveTickets(cleaned);

    await fetch(SERVER_URL + "/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "LMS",
        data: cleaned
      })
    });

    window.dispatchEvent(new Event("ticketsUpdated"));

    console.log("✔ SAVE OK");

  } catch (e) {
    console.log("SAVE ERROR", e);
  }
}

/* =========================
   LOAD SERVER (FULL DATA)
========================= */
async function loadAll(){

  try {

    let res = await fetch(SERVER_URL + "/api/get?type=LMS");
    let data = await res.json();

    if(Array.isArray(data)){

      // ❗JANGAN DI CLEAN
      DB.saveTickets(data);

      window.dispatchEvent(new Event("ticketsUpdated"));

      console.log("✔ LOAD OK");

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
   AUTO SYNC
========================= */
setInterval(saveAll, 30000);

window.addEventListener("beforeunload", saveAll);

/* =========================
   API
========================= */
window.FS = {
  DB,
  saveAll,
  loadAll
};

window.saveNow = saveAll;

})();
