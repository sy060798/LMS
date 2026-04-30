document.addEventListener("DOMContentLoaded", function () {

let noteTimer = {};
let editId = null;

/* =========================
   GET DATA
========================= */
function getData(){
  return window.syncEngine?.DB?.getTickets?.() || [];
}

/* =========================
   NOTE
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
   STATUS
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
   TABLE + SPK FILTER
========================= */
window.loadTable = function(filter = "") {

  let data = getData();

  let k = (filter || "").toLowerCase().trim();

  let rows = data.filter(x => {

    // kalau kosong tampil semua
    if (!k) return true;

    // SPK ONLY FILTER
    return (x.spk || "").toLowerCase().includes(k);

  });

  const body = document.getElementById("ticketBody");
  if (!body) return;

  body.innerHTML = rows.map((x, i) => `
<tr>

  <td>${i + 1}</td>

  <td>${x.customer || ""}</td>
  <td>${x.project || ""}</td>
  <td>${x.spk || ""}</td>
  <td>${x.type || ""}</td>
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
    <input
      value="${x.note || ""}"
      oninput="updateNote('${x.id}',this.value)"
      style="width:150px;padding:6px;border:1px solid #ccc;border-radius:6px;">
  </td>

  <!-- AKSI -->
  <td>
    <div style="display:flex;gap:6px;justify-content:center;">

      <button onclick="openMaterialById('${x.id}')">📦</button>
      <button onclick="openEdit('${x.id}')">✏️</button>
      <button onclick="hapusTicketById('${x.id}')">🗑️</button>

    </div>
  </td>

</tr>
`).join("");
};

/* =========================
   SEARCH TRIGGER FIX
========================= */
window.searchSPK = function(val){
  loadTable(val);
};

/* =========================
   MATERIAL
========================= */
window.openMaterialById = function(id){
  localStorage.setItem("activeTicketId",id);
  window.location.href = "material/material.html";
};

/* =========================
   EDIT
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
  loadTable();
};

/* =========================
   DELETE
========================= */
window.hapusTicketById = function(id){

  if(!confirm("Hapus ticket ini?")) return;

  window.syncEngine.deleteTicket(id);
  window.syncEngine.saveAll();

  loadSummary();
  loadTable();
};

/* =========================
   EXPORT EXCEL
========================= */
window.exportExcel = function () {

  let data = getData();

  let exportData = data.map((x, i) => {

    let row = {
      No: i + 1,
      Customer: x.customer || "",
      Project: x.project || "",
      SPK: x.spk || "",
      Type: x.type || "",
      Tanggal: x.tanggal || "",
      City: x.city || "",
      Status: x.status || "",
      Note: x.note || ""
    };

    let matList = (x.material || [])
      .map(m => {

        if (!m) return null;

        let name = "";
        let qty = 0;

        if (Array.isArray(m)) {
          name = m[0] || "";
          qty  = Number(m[1]) || 0;
        } else {
          name = m.name || "";
          qty  = Number(m.qty) || 0;
        }

        return qty > 0 ? { name, qty } : null;

      })
      .filter(Boolean);

    matList.forEach((mat, j) => {
      row[`Material_${j + 1}`] = mat.name;
      row[`Qty_${j + 1}`] = mat.qty;
    });

    return row;
  });

  let ws = XLSX.utils.json_to_sheet(exportData);
  let wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Tickets");
  XLSX.writeFile(wb, "FS_Ticket_Material.xlsx");

  alert("✔ Export berhasil");
};

/* =========================
   INIT
========================= */
loadSummary();
loadTable();

});
