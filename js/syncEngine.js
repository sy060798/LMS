(function () {

const SERVER_URL =
window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   TOAST
========================= */
function showToast(msg, type = "success") {

  const toast = document.createElement("div");
  toast.textContent = msg;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "10px";
  toast.style.color = "#fff";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "99999";
  toast.style.boxShadow = "0 8px 20px rgba(0,0,0,.18)";

  toast.style.background =
    type === "success" ? "#28a745" :
    type === "error" ? "#dc3545" : "#333";

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
   DELETE TICKET
========================= */
async function deleteTicket(id) {

  let data = await loadAll();

  data = data.filter(t => t.id !== id);

  await saveAll(data);
}

/* =========================
   HELPERS
========================= */
async function updateNote(id, note) {
  return updateTicket(id, t => {
    t.note = note;
    return t;
  });
}

async function updateStatus(id, status) {
  return updateTicket(id, t => {
    t.status = status;
    return t;
  });
}

async function updateMaterial(id, material) {
  return updateTicket(id, t => {
    t.material = material;
    return t;
  });
}

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
  updateMaterial

};

})();
