(function () {

const SERVER_URL =
window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   MEMORY STATE (NO LOCAL STORAGE)
========================= */
let isEditing = {
  note: {},
  status: {}
};

let autoRefreshInterval = null;

/* =========================
   TOAST
========================= */
function showToast(msg, type = "success") {

  const toast = document.createElement("div");
  toast.textContent = msg;

  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    zIndex: "99999",
    boxShadow: "0 8px 20px rgba(0,0,0,.18)",
    transition: "opacity .3s",
    background:
      type === "success" ? "#28a745" :
      type === "error" ? "#dc3545" : "#333"
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* =========================
   LOAD DATA (SERVER ONLY)
========================= */
async function loadAll() {

  try {

    const res = await fetch(`${SERVER_URL}/tickets`);
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    window.dispatchEvent(new CustomEvent("ticketsUpdated", {
      detail: data
    }));

    return data;

  } catch (err) {
    console.log("LOAD ERROR:", err);
    return [];
  }
}

/* =========================
   SAVE DATA (SERVER ONLY)
========================= */
async function saveAll(data) {

  try {

    await fetch(`${SERVER_URL}/tickets/bulk-save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    window.dispatchEvent(new CustomEvent("ticketsUpdated", {
      detail: data
    }));

    showToast("✅ Saved to server");

  } catch (err) {
    console.log("SAVE ERROR:", err);
    showToast("❌ Save gagal", "error");
  }
}

/* =========================
   UPDATE TICKET
========================= */
async function updateTicket(id, callback) {

  const data = await loadAll();

  const index = data.findIndex(t => t.id === id);
  if (index === -1) return;

  data[index] = callback({ ...data[index] });

  await saveAll(data);
}

/* =========================
   DELETE
========================= */
async function deleteTicket(id) {

  const data = await loadAll();
  const filtered = data.filter(t => t.id !== id);

  await saveAll(filtered);
}

/* =========================
   HELPERS
========================= */
async function updateNote(id, note) {
  isEditing.note[id] = false;

  return updateTicket(id, t => ({
    ...t,
    note
  }));
}

async function updateStatus(id, status) {
  isEditing.status[id] = false;

  return updateTicket(id, t => ({
    ...t,
    status
  }));
}

async function updateMaterial(id, material) {
  return updateTicket(id, t => ({
    ...t,
    material
  }));
}

/* =========================
   BIND INPUT (ANTI REFRESH BUG)
========================= */
function bindNoteInput(id, input) {

  input.addEventListener("focus", () => {
    isEditing.note[id] = true;
  });

  input.addEventListener("blur", async () => {
    isEditing.note[id] = false;
    await updateNote(id, input.value);
  });
}

function bindStatusSelect(id, select) {

  select.addEventListener("focus", () => {
    isEditing.status[id] = true;
  });

  select.addEventListener("change", async () => {
    await updateStatus(id, select.value);
    isEditing.status[id] = false;
  });
}

/* =========================
   SMART AUTO REFRESH
========================= */
function startAutoRefresh() {

  if (autoRefreshInterval) clearInterval(autoRefreshInterval);

  autoRefreshInterval = setInterval(async () => {

    const editingNow =
      Object.values(isEditing.note).includes(true) ||
      Object.values(isEditing.status).includes(true);

    if (editingNow) {
      console.log("⏸ skip refresh (user sedang edit)");
      return;
    }

    const data = await loadAll();

    window.dispatchEvent(new CustomEvent("ticketsUpdated", {
      detail: data
    }));

  }, 3000); // 3 detik
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  startAutoRefresh();
});

/* =========================
   PUBLIC API
========================= */
window.syncEngine = {

  loadAll,
  saveAll,
  updateTicket,
  deleteTicket,
  updateNote,
  updateStatus,
  updateMaterial,

  bindNoteInput,
  bindStatusSelect

};

})();
