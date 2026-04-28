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
   CLEAN BEFORE SAVE
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
   SAVE (MANUAL ONLY)
========================= */
async function saveAll(){

  try {

    let tickets = DB.getTickets();
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
   LOAD (MANUAL ONLY)
   👉 tidak auto load biar tidak “tenggelam”
========================= */
async function loadAll(){

  try {

    let res = await fetch(SERVER_URL + "/api/get?type=LMS");
    let serverData = await res.json();

    if(!Array.isArray(serverData)) return;

    let localData = DB.getTickets();

    let map = new Map();

    // LOCAL PRIORITY
    localData.forEach(t => map.set(t.id, t));

    // SERVER fill missing only
    serverData.forEach(t => {
      if(!map.has(t.id)){
        map.set(t.id, t);
      }
    });

    let merged = Array.from(map.values());

    DB.saveTickets(merged);

    window.dispatchEvent(new Event("ticketsUpdated"));

    console.log("✔ LOAD MERGED OK");

  } catch (e) {
    console.log("LOAD ERROR", e);
  }
}

/* =========================
   ❌ AUTO LOAD DIMATIKAN
   ❌ AUTO SAVE LOOP DIMATIKAN
========================= */
// (SENGAJA DIHAPUS biar manual saja)

/* =========================
   MANUAL TRIGGER ONLY
========================= */
window.saveNow = saveAll;
window.loadNow = loadAll;

/* =========================
   GLOBAL API
========================= */
window.FS = {
  DB,
  saveAll,
  loadAll
};

})();
