document.addEventListener("DOMContentLoaded", function () {

let noteTimer = {};
let editId = null;

/* =========================
   GET DATA (SERVER ONLY)
========================= */
async function getData(){
  return await window.syncEngine.loadAll();
}

/* =========================
   NOTE (SERVER SYNC)
========================= */
window.updateNote = function(id,value){

  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(async () => {

    let data = await getData();

    let index = data.findIndex(t => t.id === id);
    if(index === -1) return;

    data[index].note = value;

    await window.syncEngine.saveAll(data);

    loadSummary();
    loadTable();

  }, 300);
};

/* =========================
   STATUS
========================= */
window.updateStatus = async function(id,value){

  let data = await getData();

  let index = data.findIndex(t => t.id === id);
  if(index === -1) return;

  data[index].status = value;

  await window.syncEngine.saveAll(data);

  loadSummary();
  loadTable();
};

/* =========================
   SUMMARY
========================= */
async function loadSummary(){

  let data = await getData();

  const tot      = document.getElementById("totTicket");
  const open     = document.getElementById("openTicket");
  const progress = document.getElementById("progressTicket");
  const close    = document.getElementById("closeTicket");
  const pending  = document.getElementById("pendingTicket");
  const mat      = document.getElementById("matCount");

  if(!Array.isArray(data)) return;

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
window.loadTable = async function(filter = "") {

  let data = await getData();

  let k = (filter || "").toLowerCase().trim();

  let rows = data.filter(x => {
    if (!k) return true;
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

  <td>
    <select onchange="updateStatus('${x.id}',this.value)">
      <option value="">Pilih...</option>
      <option value="Open" ${x.status=="Open"?"selected":""}>Open</option>
      <option value="Progress" ${x.status=="Progress"?"selected":""}>Progress</option>
      <option value="Close" ${x.status=="Close"?"selected":""}>Close</option>
      <option value="Pending" ${x.status=="Pending"?"selected":""}>Pending</option>
    </select>
  </td>

  <td>
    <input
      value="${x.note || ""}"
      oninput="updateNote('${x.id}',this.value)"
      style="width:150px;padding:6px;border:1px solid #ccc;border-radius:6px;">
  </td>

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
   SEARCH
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
window.openEdit = async function(id){

  let data = await getData();
  let t = data.find(x => x.id === id);
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

window.saveEdit = async function(){

  let data = await getData();

  let index = data.findIndex(x => x.id === editId);
  if(index === -1) return;

  data[index].customer = document.getElementById("eCustomer").value;
  data[index].project  = document.getElementById("eProject").value;
  data[index].spk      = document.getElementById("eSPK").value;
  data[index].city     = document.getElementById("eCity").value;

  await window.syncEngine.saveAll(data);

  closeEdit();
  loadSummary();
  loadTable();
};

/* =========================
   DELETE
========================= */
window.hapusTicketById = async function(id){

  if(!confirm("Hapus ticket ini?")) return;

  let data = await getData();

  data = data.filter(t => t.id !== id);

  await window.syncEngine.saveAll(data);

  loadSummary();
  loadTable();
};

/* =========================
   EXPORT EXCEL (FIXED FULL)
========================= */
window.exportExcel = async function () {

  let data = await getData();

  if (!data.length) {
    alert("Data kosong!");
    return;
  }

  let filtered = data.filter(x =>
    (x.status || "").toLowerCase().includes("progress")
  );

  let ws = XLSX.utils.aoa_to_sheet([]);

  let maxMaterial = 6;
  let colWidth = 4;

  filtered.forEach((x, index) => {

    let col = index * colWidth;

    let materials = (x.material || [])
      .map(m => {
        let name = "";
        let qty = 0;

        if (Array.isArray(m)) {
          name = m[0] || "";
          qty = Number(m[1]) || 0;
        } else {
          name = m.name || m.nama || "";
          qty = Number(m.qty) || 0;
        }

        return qty > 0 ? { name, qty } : null;
      })
      .filter(Boolean);

    XLSX.utils.sheet_add_aoa(ws, [[x.spk || ""]], { origin: { r: 0, c: col } });
    XLSX.utils.sheet_add_aoa(ws, [[x.project || ""]], { origin: { r: 1, c: col } });
    XLSX.utils.sheet_add_aoa(ws, [[x.tanggal || ""]], { origin: { r: 2, c: col } });

    XLSX.utils.sheet_add_aoa(ws, [["Material", "Qty"]], {
      origin: { r: 4, c: col }
    });

    for (let i = 0; i < maxMaterial; i++) {
      let mat = materials[i];

      XLSX.utils.sheet_add_aoa(ws, [[
        mat ? mat.name : "",
        mat ? mat.qty : "-"
      ]], {
        origin: { r: 5 + i, c: col }
      });
    }

  });

  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tickets");

  XLSX.writeFile(wb, "Ticket_Form.xlsx");

  alert("✔ Export berhasil (server data)");
};

/* =========================
   INIT
========================= */
loadSummary();
loadTable();

});
