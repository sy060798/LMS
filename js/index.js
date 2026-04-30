document.addEventListener("DOMContentLoaded", function () {

let noteTimer = {};
let isEditing = {};
let editId = null;

/* =========================
   GET DATA (SERVER ONLY)
========================= */
async function getData(){
  return await window.syncEngine.loadAll();
}

/* =========================
   NOTE
========================= */
window.updateNote = function(id,value){

  isEditing[id] = true;

  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(async () => {

    let data = await getData();

    let index = data.findIndex(t => t.id === id);
    if(index === -1) return;

    data[index].note = value;

    await window.syncEngine.saveAll(data);

    isEditing[id] = false;

    loadSummary();
    loadTable();

  }, 500);
};

/* =========================
   STATUS
========================= */
window.updateStatus = async function(id,value){

  if(isEditing[id]) return;

  isEditing[id] = true;

  let data = await getData();

  let index = data.findIndex(t => t.id === id);
  if(index === -1) return;

  data[index].status = value;

  await window.syncEngine.saveAll(data);

  isEditing[id] = false;

  loadSummary();
  loadTable();
};

/* =========================
   SUMMARY
========================= */
async function loadSummary(){

  let data = await getData();
  if(!Array.isArray(data)) return;

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
   TABLE DEFAULT
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

  let input = (filter || "").toLowerCase().trim();

  let list = input.split(",").map(x => x.trim()).filter(Boolean);

  let rows = data.filter(x => {

    if (list.length === 0) return true;

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
}

/* =========================
   SEARCH
========================= */
window.searchSPK = function(val){
  loadTableBySPK(val);
};

/* =========================
   📊 EXPORT EXCEL (PAKAI PUNYAMU)
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
   UPLOAD EXCEL (SERVER IMPORT)
========================= */
window.uploadExcel = function () {

  const input = document.getElementById("excelUpload");
  const file = input.files[0];

  if (!file) {
    alert("Pilih file Excel dulu!");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function (e) {

    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
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

    let merged = [...oldData, ...newData];

    await window.syncEngine.saveAll(merged);

    alert("✔ Upload Excel berhasil masuk server!");

    loadSummary();
    loadTable();

  };

  reader.readAsArrayBuffer(file);
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
   INIT
========================= */
loadSummary();
loadTable();

});
