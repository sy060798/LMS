document.addEventListener("DOMContentLoaded", function () {

let noteTimer = {};

/* =========================
   ELEMENT
========================= */
const body   = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   GET DATA (SYNC ENGINE ONLY)
========================= */
function getData(){
  return window.syncEngine?.DB?.getTickets?.() || [];
}

/* =========================
   NOTE SAVE (DEBOUNCE)
========================= */
function saveNote(id,value){

  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(() => {

    window.syncEngine.updateTicket(id, t => {
      t.note = value;
      return t;
    });

    window.syncEngine.saveAll();

  }, 300);
}

/* =========================
   STATUS UPDATE
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
   TABLE RENDER
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

      <!-- AKSI (FIXED - 📦 TIDAK HILANG) -->
      <td>
        <div style="display:flex;gap:6px;justify-content:center;">

          <button onclick="openMaterialById('${x.id}')"
            style="border:none;padding:8px 10px;border-radius:10px;background:#3498db;color:#fff;cursor:pointer;">
            📦
          </button>

          <button onclick="editTicketById('${x.id}')"
            style="border:none;padding:8px 10px;border-radius:10px;background:#f39c12;color:#fff;cursor:pointer;">
            ✏️
          </button>

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
   NOTE GLOBAL
========================= */
window.updateNote = function(id,val){
  saveNote(id,val);
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
   OPEN MATERIAL
========================= */
window.openMaterialById = function(id){
  localStorage.setItem("activeTicketId",id);
  window.location.href = "material/material.html";
};

/* =========================
   EDIT
========================= */
window.editTicketById = function(id){

  let data = getData();
  let t = data.find(x => x.id == id);
  if(!t) return;

  let customer = prompt("Customer",t.customer);
  let project  = prompt("Project",t.project);
  let spk      = prompt("SPK",t.spk);
  let city     = prompt("City",t.city);

  window.syncEngine.updateTicket(id, x => {
    x.customer = customer || x.customer;
    x.project  = project || x.project;
    x.spk      = spk || x.spk;
    x.city     = city || x.city;
    return x;
  });

  window.syncEngine.saveAll();

  loadSummary();
  loadTable(search ? search.value : "");
};

/* =========================
   DELETE
========================= */
window.hapusTicketById = function(id){

  if(!confirm("Hapus ticket ini?")) return;

  window.syncEngine.deleteTicket?.(id) ||
  window.syncEngine.updateTicket(id, () => null);

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
