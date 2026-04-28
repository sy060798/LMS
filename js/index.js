document.addEventListener("DOMContentLoaded", function () {

let data = JSON.parse(localStorage.getItem("tickets") || "[]");

const body = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   LOAD CARD
========================= */
function loadSummary(){

document.getElementById("totTicket").textContent = data.length;

document.getElementById("openTicket").textContent =
data.filter(x => x.status === "Open").length;

document.getElementById("closeTicket").textContent =
data.filter(x => x.status === "Close").length;

document.getElementById("matCount").textContent =
data.filter(x => x.material && x.material.length > 0).length;

}

/* =========================
   SEARCH BERDASARKAN PROJECT
========================= */
function loadTable(filter=""){

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
   INPUT SEARCH
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
location.href = "material/material.html?id=" + i;
}

/* =========================
   EDIT
========================= */
window.editTicket = function(i){

let x = data[i];

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
   DELETE
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
   EXPORT
========================= */
// ================================
// EXPORT EXCEL PRO BOQ (.xlsx)
// ================================

window.exportExcel = function(){

let data = JSON.parse(localStorage.getItem("tickets") || "[]");

if(data.length === 0){
alert("Data kosong");
return;
}

/* =========================
   AMBIL MATERIAL UNIQUE
========================= */
let allMat = [];

data.forEach(t=>{
(t.material || []).forEach(m=>{
if(Number(m.qty) > 0){
if(!allMat.includes(m.nama)){
allMat.push(m.nama);
}
}
});
});

/* =========================
   SHEET DATA
========================= */
let ws_data = [];

/* HEADER 1 */
ws_data.push([
"DATA TICKET","","","","","","",
"MATERIAL","","","","","","","","",
"TOTAL"
]);

/* HEADER 2 */
let row2 = [
"No","Customer","Project","SPK","Tanggal","City","Status"
];

row2 = row2.concat(allMat);
row2.push("Grand Total");

ws_data.push(row2);

/* =========================
   DATA
========================= */
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

allMat.forEach(nama=>{
let found = (t.material || []).find(x=>x.nama === nama);

if(found){
row.push(Number(found.qty || 0));
grand += Number(found.qty || 0) * Number(found.harga || 0);
}else{
row.push("");
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
   MERGE HEADER
========================= */
ws["!merges"] = [
{ s:{r:0,c:0}, e:{r:0,c:6} },
{ s:{r:0,c:7}, e:{r:0,c:6+allMat.length} },
{ s:{r:0,c:7+allMat.length}, e:{r:0,c:7+allMat.length} }
];

/* =========================
   WIDTH
========================= */
ws["!cols"] = Array(7 + allMat.length + 1).fill({wch:20});

/* =========================
   STYLE
========================= */
function style(cell,bg,bold){

if(!ws[cell]) return;

ws[cell].s = {
font:{
bold: bold || false,
color:{rgb:"FFFFFF"}
},
fill:{
fgColor:{rgb:bg}
},
alignment:{
horizontal:"center",
vertical:"center"
},
border:{
top:{style:"thin"},
bottom:{style:"thin"},
left:{style:"thin"},
right:{style:"thin"}
}
};

}

/* HEADER STYLE */
for(let c=0;c<7+allMat.length+1;c++){
let col = XLSX.utils.encode_col(c);
style(col+"1","1565C0",true);
style(col+"2","1976D2",true);
}

/* DATA STYLE */
for(let r=3;r<=ws_data.length;r++){
for(let c=0;c<7+allMat.length+1;c++){

let cell = XLSX.utils.encode_col(c)+r;

if(ws[cell]){
ws[cell].s = {
alignment:{
horizontal: c>=7 ? "center" : "left",
vertical:"center"
},
border:{
top:{style:"thin"},
bottom:{style:"thin"},
left:{style:"thin"},
right:{style:"thin"}
}
};
}

}
}

/* FORMAT GRAND TOTAL */
let lastCol = XLSX.utils.encode_col(7+allMat.length);

for(let r=3;r<=ws_data.length;r++){
let cell = lastCol + r;
if(ws[cell]){
ws[cell].z = '#,##0';
}
}

/* =========================
   EXPORT FILE
========================= */
XLSX.utils.book_append_sheet(wb, ws, "Laporan");
XLSX.writeFile(wb, "Laporan_BOQ_Professional.xlsx");

};


/* =========================
   BUTTON EVENT FIX
========================= */
document.addEventListener("DOMContentLoaded", function(){

let btn = document.getElementById("btnExport");

if(btn){
btn.addEventListener("click", exportExcel);
}

});
/* =========================
   SAVE SERVER
========================= */
window.saveNow = function(){

if(typeof uploadTickets==="function") uploadTickets();
if(typeof uploadMaterial==="function") uploadMaterial();

alert("Data berhasil disimpan");

}

/* =========================
   START
========================= */
loadSummary();
loadTable();

});
