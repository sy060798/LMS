(function () {

const SERVER_URL =
window.SERVER_URL ||
"https://tracking-server-production-6a12.up.railway.app";

/* =========================
   LOCAL DB
========================= */
const DB = {

  getTickets() {
    try {
      return JSON.parse(
        localStorage.getItem("tickets") || "[]"
      );
    } catch {
      return [];
    }
  },

  saveTickets(data) {
    localStorage.setItem(
      "tickets",
      JSON.stringify(data || [])
    );
  },

  getActiveSpk() {
    return localStorage.getItem("activeTicketId");
  }

};

/* =========================
   ACTIVE TICKET
========================= */
function getActiveTicket() {
  return DB.getTickets().find(
    t => String(t.id) === String(DB.getActiveSpk())
  );
}

/* =========================
   CLEAN MATERIAL
========================= */
function cleanBeforeSave(tickets = []) {

  return tickets.map(t => {

    let item = { ...t };

    if (Array.isArray(item.material)) {

      item.material = item.material
        .filter(m => Number(m.qty || 0) > 0)
        .map(m => ({
          nama: m.nama || "",
          satuan: m.satuan || "",
          harga: Number(m.harga || 0),
          qty: Number(m.qty || 0)
        }));
    }

    return item;
  });
}

/* =========================
   SAVE SERVER
========================= */
async function saveAll() {

  try {

    let tickets = DB.getTickets();
    let cleaned = cleanBeforeSave(tickets);

    DB.saveTickets(cleaned);

    const res = await fetch(
      SERVER_URL + "/api/save",
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          type: "LMS",
          data: cleaned
        })
      }
    );

    if (!res.ok) throw new Error("Save gagal");

    window.dispatchEvent(
      new Event("ticketsUpdated")
    );

    console.log("✔ SAVE OK");

  } catch (err) {
    console.log("SAVE ERROR:", err);
  }
}

/* =========================
   LOAD SERVER + MERGE
========================= */
async function loadAll() {

  try {

    const res = await fetch(
      SERVER_URL + "/api/get?type=LMS"
    );

    let serverData = await res.json();

    if (!Array.isArray(serverData)) {
      serverData = [];
    }

    const localData = DB.getTickets();

    const map = new Map();

    /* local priority */
    localData.forEach(t => {
      map.set(String(t.id), t);
    });

    /* fill missing from server */
    serverData.forEach(t => {
      const id = String(t.id);

      if (!map.has(id)) {
        map.set(id, t);
      }
    });

    const merged = Array.from(map.values());

    DB.saveTickets(merged);

    window.dispatchEvent(
      new Event("ticketsUpdated")
    );

    console.log("✔ LOAD OK");

    return merged;

  } catch (err) {

    console.log("LOAD ERROR:", err);

    return DB.getTickets();
  }
}

/* =========================
   UPDATE ONE TICKET
========================= */
async function updateTicket(id, callback) {

  let data = DB.getTickets();

  let index = data.findIndex(
    x => String(x.id) === String(id)
  );

  if (index === -1) return;

  if (typeof callback === "function") {
    data[index] = callback({
      ...data[index]
    });
  } else if (
    callback &&
    typeof callback === "object"
  ) {
    data[index] = {
      ...data[index],
      ...callback
    };
  }

  DB.saveTickets(data);

  await saveAll();
}

/* =========================
   DELETE
========================= */
async function deleteTicket(id) {

  let data = DB.getTickets().filter(
    x => String(x.id) !== String(id)
  );

  DB.saveTickets(data);

  await saveAll();
}

/* =========================
   NOTE
========================= */
async function updateNote(id, note) {
  await updateTicket(id, { note });
}

/* =========================
   STATUS
========================= */
async function updateStatus(id, status) {
  await updateTicket(id, { status });
}

/* =========================
   MATERIAL
========================= */
async function updateMaterial(id, material) {
  await updateTicket(id, { material });
}

/* =========================
   AUTO SAVE
========================= */
let syncTimer = null;

function autoSave() {

  clearTimeout(syncTimer);

  syncTimer = setTimeout(() => {
    saveAll();
  }, 5000);
}

/* =========================
   AUTO BACKGROUND SAVE
========================= */
setInterval(() => {
  saveAll();
}, 30000);

window.addEventListener(
  "beforeunload",
  saveAll
);

/* =========================
   INIT
========================= */
document.addEventListener(
  "DOMContentLoaded",
  async () => {
    await loadAll();
  }
);

/* =========================
   GLOBAL API
========================= */
window.syncEngine = {

  DB,
  getActiveTicket,

  saveAll,
  loadAll,

  updateTicket,
  deleteTicket,

  updateNote,
  updateStatus,
  updateMaterial,

  autoSave

};

window.saveNow = saveAll;
window.loadNow = loadAll;

})();
