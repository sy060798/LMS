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
   GET ACTIVE TICKET
========================= */
function getActiveTicket(){
  return DB.getTickets().find(t => t.id == DB.getActiveSpk());
}

/* =========================
   CLEAN MATERIAL (ONLY QTY > 0)
========================= */
function cleanMaterials(tickets){

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
   🔥 SAVE ALL (LOCAL + SERVER)
========================= */
async function saveAll(){

  try {

    let tickets = DB.getTickets();

    // clean material
    tickets = cleanMaterials(tickets);

    // save local
    DB.saveTickets(tickets);

    // push server
    await fetch(SERVER_URL + "/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "LMS",
        data: tickets
      })
    });

    // trigger UI update
    window.dispatchEvent(new Event("ticketsUpdated"));

    console.log("✔ SAVE SUCCESS");

  } catch (e) {
    console.log("❌ SAVE ERROR", e);
  }
}

/* =========================
   🔥 LOAD FROM SERVER
========================= */
async function loadAll(){

  try {

    let res = await fetch(SERVER_URL + "/api/get?type=LMS");
    let data = await res.json();

    if(Array.isArray(data)){

      // clean data server juga
      data = cleanMaterials(data);

      // save ke local
      DB.saveTickets(data);

      // trigger UI update
      window.dispatchEvent(new Event("ticketsUpdated"));

      console.log("✔ LOAD SUCCESS");

    }

  } catch (e) {
    console.log("❌ LOAD ERROR", e);
  }
}

/* =========================
   AUTO INIT LOAD
========================= */
(async function(){
  await loadAll();
})();

/* =========================
   AUTO SYNC (OPTIONAL)
========================= */
setInterval(saveAll, 30000);

window.addEventListener("beforeunload", saveAll);

/* =========================
   GLOBAL API
========================= */
window.FS = {
  DB,
  saveAll,
  loadAll,
  cleanMaterials
};

window.saveNow = saveAll;

})();
