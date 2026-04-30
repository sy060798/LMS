document.addEventListener("DOMContentLoaded", function () {

let noteTimer = {};
let editId = null;

/* =========================
   GET DATA (ONLY FROM SYNC ENGINE)
========================= */
function getData(){
  return window.syncEngine?.DB?.getTickets?.() || [];
}

/* =========================
   NOTE (DEBOUNCE SAFE → SYNC ENGINE)
========================= */
window.updateNote = function(id,value){

  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(() => {

    window.syncEngine.updateTicket(id, t => {
      t.note = value;
      return t;
    });

    window.syncEngine.saveAll();

  }, 300);
};

/* =========================
   STATUS (SYNC ENGINE ONLY)
========================= */
window.updateStatus = function(id,value){

  window.syncEngine.updateTicket(id, t => {
    t.status = value;
    return t;
  });

  window.syncEngine.saveAll();
  loadSummary();
};

/* =========================
   SUMMARY
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
  if(mat) mat.textContent = data.filter(x => x.material?.length > 0).length;
}

/* =========================
   TABLE
========================= */
function loadTable(filter=""){

  let data = getData();

  let rows = data.filter(x => {

    let k = filter.toLowerCase();

    return (
      (x.customer || "").toLowerCase().includes(k) ||
      (x.project || "").toLowerCase().includes(k) ||
      (x.spk || "").toLowerCase().includes(k) ||
      (x.city || "").toLowerCase().includes(k)
    );

  });

  const body = document.getElementById("ticketBody");
  if(!body) return;

  body.innerHTML = rows.map(x => `
    <tr>

      <td>${x.customer || ""}</td>
      <td>${x.project || ""}</td>
      <td>${x.spk || ""}</td>
      <td>${x.tanggal || ""}</td>
      <td>${x.city || ""}</td>

      <!-- STATUS -->
      <td>
        <select onchange="updateStatus('${x.id}',this.value)">
          <option value="">Pilih...</option>
          <option value="Open" ${x.status=="Open"?"selected":""}>Open</option>
          <option value="Progress" ${x.status=="Progress"?"selected":""}>Progress</option>
          <option value="Close" ${x.status=="Close"?"selected":""}>Close</option>
          <option value="Pending" ${x.status=="Pending"?"selected":""}>Pending</option>
        </select>
      </td>

      <!-- NOTE -->
      <td>
        <input value="${x.note || ""}"
          oninput="updateNote('${x.id}',this.value)">
      </td>

      <!-- AKSI -->
      <td>
        <div style="display:flex;gap:6px;justify-content:center;">

          <button onclick="openMaterialById('${x.id}')"
            style="border:none;padding:8px 10px;border-radius:10px;background:#3498db;color:#fff;cursor:pointer;">
            📦
          </button>

          <!-- EDIT -->
          <button onclick="openEdit('${x.id}')"
            style="border:none;padding:8px 10px;border-radius:10px;background:#f39c12;color:#fff;cursor:pointer;">
            ✏️
          </button>

          <!-- DELETE -->
          <button onclick="hapusTicketById('${x.id}')"
            style="border:none;padding:8px 10px;border-radius:10px;background:#e74c3c;color:#fff;cursor:pointer;">
            🗑️
          </button>

        </div>
      </td>

    </tr>
  `).join("");
}

/* =========================
   SEARCH
========================= */
const search = document.getElementById("searchCustomer");
if(search){
  search.addEventListener("input",function(){
    loadTable(this.value);
  });
}

/* =========================
   MATERIAL
========================= */
window.openMaterialById = function(id){
  localStorage.setItem("activeTicketId",id);
  window.location.href = "material/material.html";
};

/* =========================
   EDIT POPUP
========================= */
window.openEdit = function(id){

  let t = getData().find(x => x.id === id);
  if(!t) return;

  editId = id;

  document.getElementById("eCustomer").value = t.customer || "";
  document.getElementById("eProject").value  = t.project || "";
  document.getElementById("eSPK").value      = t.spk || "";
  document.getElementById("eCity").value     = t.city || "";

  document.getElementById("editPopup").style.display = "flex";
};

window.closeEdit = function(){
  document.getElementById("editPopup").style.display = "none";
};

window.saveEdit = function(){

  let customer = document.getElementById("eCustomer").value;
  let project  = document.getElementById("eProject").value;
  let spk      = document.getElementById("eSPK").value;
  let city     = document.getElementById("eCity").value;

  window.syncEngine.updateTicket(editId, x => {
    x.customer = customer || x.customer;
    x.project  = project || x.project;
    x.spk      = spk || x.spk;
    x.city     = city || x.city;
    return x;
  });

  window.syncEngine.saveAll();

  closeEdit();
  loadSummary();
  loadTable(search ? search.value : "");
};

/* =========================
   DELETE (FULL SYNC SAFE)
========================= */
window.hapusTicketById = function(id){

  if(!confirm("Hapus ticket ini?")) return;

  window.syncEngine.deleteTicket(id);

  window.syncEngine.saveAll();

  loadSummary();
  loadTable(search ? search.value : "");
};

/* =========================
   INIT
========================= */
loadSummary();
loadTable();

});
