document.addEventListener("DOMContentLoaded", function () {

const SERVER_URL =
window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   ELEMENT
========================= */
const body   = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   DATA MEMORY ONLY
========================= */
let data = [];

/* =========================
   LOAD SERVER ONLY
========================= */
async function getServerData() {
  try {
    const res = await fetch(`${SERVER_URL}/tickets`);
    const json = await res.json();

    if (!Array.isArray(json)) return [];

    return json;

  } catch (err) {
    console.log("LOAD ERROR:", err);
    return [];
  }
}

/* =========================
   RENDER TABLE
========================= */
function renderTable(list = data) {

  if (!body) return;

  body.innerHTML = "";

  if (!list.length) {
    body.innerHTML = `
      <tr>
        <td colspan="20" style="text-align:center;padding:20px;color:#888">
          Tidak ada data
        </td>
      </tr>
    `;
    return;
  }

  list.forEach((item, i) => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.customer || ""}</td>
      <td>${item.project || ""}</td>
      <td>${item.spk || ""}</td>
      <td>${item.type || ""}</td>
      <td>${item.qty || ""}</td>
      <td>${item.deadline || ""}</td>
      <td>${item.status || ""}</td>
      <td>${item.note || ""}</td>
    `;

    body.appendChild(tr);
  });
}

/* =========================
   LOAD + REFRESH
========================= */
async function refreshData() {
  data = await getServerData();
  renderTable(data);
}

/* =========================
   SEARCH
========================= */
if (search) {
  search.addEventListener("input", function () {

    const key = this.value.toLowerCase();

    const filtered = data.filter(x =>
      (x.customer || "").toLowerCase().includes(key) ||
      (x.project || "").toLowerCase().includes(key) ||
      (x.spk || "").toLowerCase().includes(key)
    );

    renderTable(filtered);
  });
}

/* =========================
   AUTO REFRESH SERVER
========================= */
setInterval(refreshData, 5000);

/* =========================
   INIT
========================= */
refreshData();

});
