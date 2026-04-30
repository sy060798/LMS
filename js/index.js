document.addEventListener("DOMContentLoaded", function () {

let data = [];

/* =========================
   ELEMENT
========================= */
const body   = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   AMBIL DATA DARI SYNC ENGINE
========================= */
function getData(){
  return window.DB?.getTickets?.() || window.data || [];
}

/* =========================
   RENDER SUMMARY
========================= */
function loadSummary(){

  let data = getData();

  const tot      = document.getElementById("totTicket");
  const open     = document.getElementById("openTicket");
  const progress = document.getElementById("progressTicket");
  const close    = document.getElementById("closeTicket");
  const pending  = document.getElementById("pendingTicket");
  const mat      = document.getElementById("matCount");

  if(tot) tot.textContent = data.length;
  if(open) open.textContent = data.filter(x => x.status=="Open").length;
  if(progress) progress.textContent = data.filter(x => x.status=="Progress").length;
  if(close) close.textContent = data.filter(x => x.status=="Close").length;
  if(pending) pending.textContent = data.filter(x => x.status=="Pending").length;
  if(mat) mat.textContent = data.filter(x => x.material && x.material.length > 0).length;
}

/* =========================
   RENDER TABLE
========================= */
function loadTable(filter=""){

  let data = getData();
  let k = filter.toLowerCase();

  let rows = data.filter(x => (
    (x.customer || "").toLowerCase().includes(k) ||
    (x.project || "").toLowerCase().includes(k) ||
    (x.spk || "").toLowerCase().includes(k) ||
    (x.city || "").toLowerCase().includes(k) ||
    (x.type || "").toLowerCase().includes(k)
  ));

  if(!body) return;

  body.innerHTML = rows.slice(-50).reverse().map((x,i)=>{

    return `
    <tr>

      <td>${x.no ?? "-"}</td>
      <td>${x.customer || ""}</td>
      <td>${x.project || ""}</td>
      <td>${x.spk || ""}</td>
      <td>${x.tanggal || ""}</td>
      <td>${x.city || ""}</td>
      <td>${x.type || ""}</td>

      <td>
        <select onchange="updateStatus('${x.id}',this.value)">
          <option value="">Pilih</option>
          <option value="Open" ${x.status=="Open"?"selected":""}>Open</option>
          <option value="Progress" ${x.status=="Progress"?"selected":""}>Progress</option>
          <option value="Close" ${x.status=="Close"?"selected":""}>Close</option>
          <option value="Pending" ${x.status=="Pending"?"selected":""}>Pending</option>
        </select>
      </td>

      <td>
        <input type="text"
        value="${x.note || ""}"
        oninput="updateNote('${x.id}',this.value)">
      </td>

      <td>
        <div style="display:flex;gap:6px;justify-content:center;">

          <button onclick="openMaterialById('${x.id}')">📦</button>
          <button onclick="editTicketById('${x.id}')">✏️</button>
          <button onclick="hapusTicketById('${x.id}')">🗑️</button>

        </div>
      </td>

    </tr>
    `;
  }).join("");
}

/* =========================
   GLOBAL FUNCTIONS
========================= */
window.updateNote = function(id,val){
  window.FS?.saveAll?.(); // optional sync
};

window.updateStatus = function(id,val){

  fetch(`${window.SERVER_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: val })
  }).then(() => {
    window.syncEngine?.loadData?.();
  });

};

/* =========================
   SEARCH
========================= */
if(search){
  search.addEventListener("input",function(){
    loadTable(this.value);
  });
}

/* =========================
   MATERIAL
========================= */
window.openMaterialById = function(id){
  sessionStorage.setItem("activeTicketId",id);
  window.location.href = "material/material.html";
};

/* =========================
   EDIT
========================= */
window.editTicketById = async function(id){

  let data = getData();
  let x = data.find(t => t.id == id);
  if(!x) return;

  let customer = prompt("Customer", x.customer);
  let project  = prompt("Project", x.project);
  let spk      = prompt("SPK", x.spk);
  let city     = prompt("City", x.city);

  if(!spk) return alert("SPK tidak boleh kosong");

  let duplicate = data.some(t =>
    t.id !== id && (t.spk || "").toLowerCase() === spk.toLowerCase()
  );

  if(duplicate){
    alert("❌ SPK sudah dipakai!");
    return;
  }

  await fetch(`${window.SERVER_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: customer || x.customer,
      project: project || x.project,
      spk,
      city: city || x.city
    })
  });

  window.syncEngine?.loadData?.();
};

/* =========================
   DELETE
========================= */
window.hapusTicketById = async function(id){

  if(!confirm("Hapus ticket ini?")) return;

  await fetch(`${window.SERVER_URL}/tickets/${id}`, {
    method: "DELETE"
  });

  window.syncEngine?.loadData?.();
};

/* =========================
   LISTEN SYNC
========================= */
window.addEventListener("ticketsUpdated", () => {
  loadSummary();
  loadTable(search ? search.value : "");
});

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  loadSummary();
  loadTable();
});

});
