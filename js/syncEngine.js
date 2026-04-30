(function () {

const SERVER_URL =
window.SERVER_URL ||
"https://tracking-server-production-6a12.up.railway.app";

/* =========================
   CACHE ONLY
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
    x => String(x.id) === String(DB.getActiveSpk())
  );
}

/* =========================
   LOAD = SERVER PRIORITY
========================= */
async function loadAll() {

  try {

    const res = await fetch(
      SERVER_URL + "/api/get?type=LMS&t=" + Date.now()
    );

    const serverData = await res.json();

    if (!Array.isArray(serverData)) {
      return [];
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
   SAVE = SERVER MAIN
========================= */
async function saveAll(data = null) {

  try {

    const rows = Array.isArray(data)
      ? data
      : DB.getTickets();

    await fetch(
      SERVER_URL + "/api/save",
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          type: "LMS",
          data: rows
        })
      }
    );

    DB.saveTickets(rows);

    window.dispatchEvent(
      new CustomEvent("ticketsUpdated", {
        detail: rows
      })
    );

    return rows;

  } catch (err) {

    console.log("SAVE ERROR:", err);

    return [];
  }
}

/* =========================
   UPDATE ONE ROW
========================= */
async function updateTicket(id, updater) {

  let rows = await loadAll();

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

  await saveAll(rows);
}

/* =========================
   DELETE
========================= */
async function deleteTicket(id) {

  let rows = await loadAll();

  rows = rows.filter(
    x => String(x.id) !== String(id)
  );

  await saveAll(rows);
}

/* =========================
   NOTE
========================= */
async function updateNote(id, note) {
  await updateTicket(id, {
    note: note
  });
}

/* =========================
   STATUS
========================= */
async function updateStatus(id, status) {
  await updateTicket(id, {
    status: status
  });
}

/* =========================
   MATERIAL
========================= */
async function updateMaterial(id, material) {
  await updateTicket(id, {
    material: material
  });
}

/* =========================
   AUTO REFRESH SERVER
========================= */
setInterval(loadAll, 5000);

/* =========================
   INIT
========================= */
document.addEventListener(
  "DOMContentLoaded",
  loadAll
);

/* =========================
   GLOBAL API
========================= */
window.syncEngine = {

  DB,
  getActiveTicket,

  loadAll,
  saveAll,

  updateTicket,
  deleteTicket,

  updateNote,
  updateStatus,
  updateMaterial

};

})();
