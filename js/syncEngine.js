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
      return JSON.parse(localStorage.getItem("tickets") || "[]");
    } catch (e) {
      return [];
    }
  },

  saveTickets(data) {
    localStorage.setItem("tickets", JSON.stringify(data || []));
  },

  getActiveSpk() {
    return localStorage.getItem("activeTicketId");
  }
};

/* =========================
   ACTIVE
========================= */
function getActiveTicket() {
  return DB.getTickets().find(
    x => String(x.id) === String(DB.getActiveSpk())
  );
}

/* =========================
   CLEAN DATA
========================= */
function cleanBeforeSave(rows = []) {

  return rows.map(t => {

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
   SAVE
========================= */
async function saveAll() {

  try {

    let rows = DB.getTickets();
    rows = cleanBeforeSave(rows);

    DB.saveTickets(rows);

    await fetch(`${SERVER_URL}/api/save`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        type:"LMS",
        data: rows
      })
    });

    window.dispatchEvent(
      new Event("ticketsUpdated")
    );

    return rows;

  } catch (err) {
    console.log("SAVE ERROR:", err);
    return [];
  }
}

/* =========================
   LOAD
========================= */
async function loadAll() {

  try {

    const res = await fetch(
      `${SERVER_URL}/api/get?type=LMS`
    );

    let serverData = await res.json();

    if (!Array.isArray(serverData)) {
      serverData = [];
    }

    DB.saveTickets(serverData);

    window.dispatchEvent(
      new CustomEvent("ticketsUpdated", {
        detail: serverData
      })
    );

    return serverData;

  } catch (err) {

    console.log("LOAD ERROR:", err);

    return DB.getTickets();
  }
}

/* =========================
   UPDATE
========================= */
async function updateTicket(id, updater) {

  let rows = DB.getTickets();

  let index = rows.findIndex(
    x => String(x.id) === String(id)
  );

  if (index === -1) return;

  if (typeof updater === "function") {
    rows[index] = updater({
      ...rows[index]
    });
  } else {
    rows[index] = {
      ...rows[index],
      ...updater
    };
  }

  DB.saveTickets(rows);

  await saveAll();
}

/* =========================
   DELETE
========================= */
async function deleteTicket(id) {

  let rows = DB.getTickets().filter(
    x => String(x.id) !== String(id)
  );

  DB.saveTickets(rows);

  await saveAll();
}

/* =========================
   SHORTCUTS
========================= */
async function updateNote(id, note) {
  await updateTicket(id, { note: note });
}

async function updateStatus(id, status) {
  await updateTicket(id, { status: status });
}

async function updateMaterial(id, material) {
  await updateTicket(id, { material: material });
}

/* =========================
   AUTO SAVE
========================= */
let timer = null;

function autoSave() {

  clearTimeout(timer);

  timer = setTimeout(() => {
    saveAll();
  }, 5000);
}

setInterval(saveAll, 30000);

window.addEventListener(
  "beforeunload",
  saveAll
);

/* =========================
   INIT
========================= */
document.addEventListener(
  "DOMContentLoaded",
  loadAll
);

/* =========================
   GLOBAL
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
