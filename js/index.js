document.addEventListener("DOMContentLoaded", function () {

let noteTimer = {};
let isEditing = {};
let editId = null;

/* =========================
   GET DATA (SERVER ONLY)
========================= */
async function getData(){
  try {
    const data = await window.syncEngine.loadAll();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log("LOAD ERROR:", err);
    return [];
  }
}

/* =========================
   NOTE (DEBOUNCE SAFE)
========================= */
window.updateNote = function(id,value){

  isEditing[id] = true;

  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(() => {

    window.syncEngine.updateNote(id, value);

    isEditing[id] = false;

  }, 500);
};

/* =========================
   STATUS
========================= */
window.updateStatus = function(id,value){

  if(isEditing[id]) return;

  isEditing[id] = true;

  window.syncEngine.updateStatus(id, value);

  isEditing[id] = false;
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

  const safe = (v) => Array.isArray(v) ? v : [];

  if(tot) tot.textContent = data.length;

  if(open) open.textContent = safe(data).filter(x => x.status=="Open").length;
  if(progress) progress.textContent = safe(data).filter(x => x.status=="Progress").length;
  if(close) close.textContent = safe(data).filter(x => x.status=="Close").length;
  if(pending) pending.textContent = safe(data).filter(x => x.status=="Pending").length;
  if(mat) mat.textContent = safe(data).filter(x => x.material?.length > 0).length;
}

/* =========================
   TABLE FILTER (SPK)
========================= */
window.loadTable = async function(filter = "") {

  let data = await getData();

  let k = (filter || "").toLowerCase().trim();

  let rows = data.filter(x => {
    if (!k) return true;
    return (x.spk || "").toLowerCase().includes(k);
  });

  renderTable(rows);
};

/* =========================
   MULTI SPK SEARCH
========================= */
window.loadTableBySPK = async function(filter = "") {

  let data = await getData();

  let list = (filter || "")
    .toLowerCase()
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  let rows = data.filter(x => {

    if (!list.length) return true;

    let spk = (x.spk || "").toLowerCase();

    return list.some(id => spk.includes(id));
  });

  renderTable(rows);
};

/* =========================
   RENDER TABLE
========================= */
function renderTable(rows){

  const body = document.getElementById("ticketBody");
  if (!body) return;

  if (!Array.isArray(rows)) rows = [];

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
    <button onclick="openMaterialById('${x.id}')">📦</button>
    <button onclick="openEdit('${x.id}')">✏️</button>
    <button onclick="hapusTicketById('${x.id}')">🗑️</button>
  </td>

</tr>
`).join("");
}

/* =========================
   SEARCH INPUT
========================= */
window.searchSPK = function(val){
  loadTableBySPK(val);
};

/* =========================
   EXPORT EXCEL
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

    XLSX.utils.sheet_add_aoa(ws, [["Material","Qty"]], {
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

  alert("✔ Export berhasil!");
};

/* =========================
   IMPORT EXCEL (SERVER SYNC)
========================= */
window.uploadExcel = function () {

  const file = document.getElementById("excelUpload")?.files?.[0];

  if (!file) {
    alert("Pilih file Excel!");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function (e) {

    const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    let oldData = await getData();

    let newData = json.map((row, i) => ({

      id: Date.now() + i,

      spk: row["Reference Code"] || "",
      tanggal: row["Wo End"] || "",
      customer: row["Customer"] || "",
      project: row["End Customer"] || "",
      type: row["Job Name"] || "",
      city: row["City"] || "",

      status: "Open",
      note: "",
      material: []

    }));

    await window.syncEngine.saveAll([...oldData, ...newData]);

    alert("✔ Import Excel sukses!");

    loadSummary();
    loadTable();

  };

  reader.readAsArrayBuffer(file);
};

/* =========================
   EDIT / DELETE
========================= */
window.openEdit = async function(id){

  let t = (await getData()).find(x => x.id === id);
  if(!t) return;

  editId = id;

  eCustomer.value = t.customer;
  eProject.value = t.project;
  eSPK.value = t.spk;
  eCity.value = t.city;

  editPopup.style.display = "flex";
};

window.saveEdit = function(){

  window.syncEngine.updateTicket(editId, {
    customer: eCustomer.value,
    project: eProject.value,
    spk: eSPK.value,
    city: eCity.value
  });

  editPopup.style.display = "none";
};

window.hapusTicketById = function(id){
  window.syncEngine.deleteTicket(id);
};

/* =========================
   INIT SAFE
========================= */
(async function init(){
  await loadSummary();
  await loadTable();
})();

/* =========================
   AUTO REFRESH
========================= */
setInterval(() => {
  loadSummary();
  loadTable();
}, 4000);

});
