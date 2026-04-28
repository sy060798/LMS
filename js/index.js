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
window.exportExcel = function(){

let data = JSON.parse(localStorage.getItem("tickets") || "[]");

if(!data.length){
alert("Data kosong");
return;
}

/* =========================
   NORMALIZE MATERIAL LIST
========================= */
function norm(x){
return (x || "").toString().trim().toLowerCase();
}

/* =========================
   COLLECT ALL MATERIAL (SAFE)
========================= */
let matMap = new Map();

data.forEach(t=>{
(t.material || []).forEach(m=>{
if(Number(m.qty) > 0){
matMap.set(norm(m.nama), m.nama);
}
});
});

let allMat = Array.from(matMap.values());

/* =========================
   SHEET
========================= */
let ws_data = [];

/* HEADER */
ws_data.push([
"DATA TICKET","","","","","","",
"MATERIAL","","","","","","","","",
"TOTAL"
]);

let row2 = [
"No","Customer","Project","SPK","Tanggal","City","Status"
];

row2 = row2.concat(allMat);
row2.push("Grand Total");

ws_data.push(row2);

/* =========================
   ROW DATA
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

allMat.forEach(matName=>{

let found = (t.material || []).find(m =>
norm(m.nama) === norm(matName)
);

if(found && Number(found.qty) > 0){

row.push(Number(found.qty));
grand += Number(found.qty) * Number(found.harga || 0);

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

/* MERGE */
ws["!merges"] = [
{ s:{r:0,c:0}, e:{r:0,c:6} },
{ s:{r:0,c:7}, e:{r:0,c:6+allMat.length} },
{ s:{r:0,c:7+allMat.length}, e:{r:0,c:7+allMat.length} }
];

/* WIDTH */
ws["!cols"] = Array(7 + allMat.length + 1).fill({wch:18});

/* STYLE FUNCTION */
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

/* HEADER */
for(let c=0;c<7+allMat.length+1;c++){
let col = XLSX.utils.encode_col(c);
style(col+"1","0D47A1",true);
style(col+"2","1565C0",true);
}

/* DATA STYLE + MATERIAL COLOR */
for(let r=3;r<=ws_data.length;r++){
for(let c=0;c<7+allMat.length+1;c++){

let cell = XLSX.utils.encode_col(c)+r;

if(ws[cell]){

let isMat = c>=7 && c<7+allMat.length;

ws[cell].s = {
fill: isMat ? {fgColor:{rgb:"D7B899"}} : undefined,
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

/* GRAND TOTAL */
let lastCol = XLSX.utils.encode_col(7+allMat.length);

for(let r=3;r<=ws_data.length;r++){
let cell = lastCol + r;
if(ws[cell]){
ws[cell].z = '#,##0';
}
}

/* EXPORT */
XLSX.utils.book_append_sheet(wb, ws, "Laporan");
XLSX.writeFile(wb, "Laporan_BOQ_Professional.xlsx");

};
/* =========================
   SAVE SERVER
========================= */
window.saveNow = async function(){

try{

showLoading("Saving to server...");

if(typeof uploadTickets === "function"){
await uploadTickets();
}

if(typeof uploadMaterial === "function"){
await uploadMaterial();
}

hideLoading();

alert("Data berhasil disimpan ke server");

}catch(e){

hideLoading();

console.log(e);

alert("Gagal sync ke server");

}

};

/* =========================
   START
========================= */
loadSummary();
loadTable();

});
