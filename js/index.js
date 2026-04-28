document.addEventListener("DOMContentLoaded", function () {

let data = JSON.parse(localStorage.getItem("tickets") || "[]");

const body = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   SAFE REFRESH DATA
========================= */
function refreshData(){
  data = JSON.parse(localStorage.getItem("tickets") || "[]");
}

/* =========================
   LOAD CARD
========================= */
function loadSummary(){

refreshData();

document.getElementById("totTicket").textContent = data.length;

document.getElementById("openTicket").textContent =
data.filter(x => x.status === "Open").length;

document.getElementById("closeTicket").textContent =
data.filter(x => x.status === "Close").length;

document.getElementById("matCount").textContent =
data.filter(x => x.material && x.material.length > 0).length;

}

/* =========================
   TABLE
========================= */
function loadTable(filter=""){

refreshData();

let rows = data.filter(x =>
(x.project || "").toLowerCase().includes(filter.toLowerCase())
);

body.innerHTML = rows.slice(-50).reverse().map((x,i)=>`
<tr>
<td>${i+1}</td>
<td>${x.customer || ""}</td>
<td>${x.project || ""}</td>
<td>${x.spk || ""}</td>
<td>${x.tanggal || ""}</td>
<td>${x.city || ""}</td>
<td><span class="status">${x.status || ""}</span></td>
<td>
<div class="aksi">
<button class="icon-btn box-btn" onclick="openMaterial(${data.indexOf(x)})">📦</button>
<button class="icon-btn edit-btn" onclick="editTicket(${data.indexOf(x)})">✏️</button>
<button class="icon-btn del-btn" onclick="hapusTicket(${data.indexOf(x)})">🗑️</button>
</div>
</td>
</tr>
`).join("");

}

/* =========================
   SEARCH SAFE
========================= */
if(search){
search.placeholder = "Cari Nama Project...";
search.addEventListener("input", function(){
loadTable(this.value);
});
}

/* =========================
   OPEN MATERIAL
========================= */
window.openMaterial = function(i){
  localStorage.setItem("activeTicketId", data[i].id || i);
  location.href = "material/material.html?id=" + i;
}

/* =========================
   EDIT SAFE
========================= */
window.editTicket = function(i){

let x = data[i];
if(!x) return;

x.customer = prompt("Customer", x.customer) || x.customer;
x.project  = prompt("Project", x.project) || x.project;
x.spk      = prompt("SPK", x.spk) || x.spk;
x.city     = prompt("City", x.city) || x.city;
x.status   = prompt("Status", x.status) || x.status;

localStorage.setItem("tickets", JSON.stringify(data));

loadSummary();
loadTable(search.value);

}

/* =========================
   DELETE SAFE
========================= */
window.hapusTicket = function(i){

if(confirm("Hapus ticket ini?")){

data.splice(i,1);

localStorage.setItem("tickets", JSON.stringify(data));

loadSummary();
loadTable(search.value);

}

}

/* =========================
   EXPORT (FIXED STABLE)
========================= */
window.exportExcel = function(){

refreshData();

if(!data.length){
alert("Data kosong");
return;
}

function norm(x){
return (x || "").toString().trim().toLowerCase();
}

/* =========================
   AMBIL MATERIAL (QTY >= 1)
========================= */
let matMap = new Map();

data.forEach(t=>{
(t.material || []).forEach(m=>{

let qty = Number(m.qty || 0);

if(qty >= 1 && m.nama){

matMap.set(norm(m.nama), {
nama: m.nama,
harga: Number(m.harga || 0)
});

}

});
});

let allMat = Array.from(matMap.values());

/* =========================
   DATA SHEET
========================= */
let ws_data = [];

ws_data.push([
"DATA TICKET","","","","","","",
"Material","","",
""
]);

ws_data.push([
"No","Customer","Project","SPK","Tanggal","City","Status",
...allMat.map(m => m.nama),
"Grand Total"
]);

data.forEach((t,i)=>{

let row = [
i+1,
t.customer || "",
t.project || "",
t.spk || "",
t.tanggal || "",
t.city || "",
t.status || ""
];

let grand = 0;

allMat.forEach(mat=>{

let found = (t.material || []).find(m =>
norm(m.nama) === norm(mat.nama) && Number(m.qty) >= 1
);

if(found){

let total = Number(found.qty) * Number(found.harga || mat.harga || 0);

row.push(total);
grand += total;

}else{
row.push(0);
}

});

row.push(grand);

ws_data.push(row);

});

/* =========================
   WORKBOOK
========================= */
let wb = XLSX.utils.book_new();
let ws = XLSX.utils.aoa_to_sheet(ws_data);

/* =========================
   STYLE HEADER (WARNA)
========================= */
function styleCell(cell, color){

if(!ws[cell]) return;

ws[cell].s = {
fill: {
patternType: "solid",
fgColor: { rgb: color }
},
font: {
bold: true,
color: { rgb: "FFFFFF" }
},
alignment: {
horizontal: "center",
vertical: "center"
},
border: {
top: { style: "thin" },
bottom: { style: "thin" },
left: { style: "thin" },
right: { style: "thin" }
}
};

}

/* HEADER ROW 1 */
for(let c=0;c<7+allMat.length+1;c++){
let col = XLSX.utils.encode_col(c);
styleCell(col+"1","1F4E79"); // biru tua
}

/* HEADER ROW 2 */
for(let c=0;c<7+allMat.length+1;c++){
let col = XLSX.utils.encode_col(c);
styleCell(col+"2","2F75B5"); // biru sedang
}

/* WIDTH */
ws["!cols"] = Array(7 + allMat.length + 1).fill({wch:18});

/* EXPORT */
XLSX.utils.book_append_sheet(wb, ws, "BOQ");
XLSX.writeFile(wb, "BOQ_Material_Color.xlsx");

};

/* =========================
   SAVE SERVER SAFE
========================= */
window.saveNow = async function(){

try{

if(typeof showLoading === "function") showLoading("Saving...");

if(typeof uploadTickets === "function") await uploadTickets();
if(typeof uploadMaterial === "function") await uploadMaterial();

if(typeof hideLoading === "function") hideLoading();

alert("Data berhasil disimpan ke server");

}catch(e){

if(typeof hideLoading === "function") hideLoading();

console.log(e);

alert("Gagal sync ke server");

}

};

/* =========================
   INIT
========================= */
loadSummary();
loadTable();

});
