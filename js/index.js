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

if(data.length===0){
alert("Data kosong");
return;
}

let csv = [];

csv.push([
"No","Customer","Project","SPK","Tanggal","City","Status"
]);

data.forEach((x,i)=>{

csv.push([
i+1,
x.customer || "",
x.project || "",
x.spk || "",
x.tanggal || "",
x.city || "",
x.status || ""
]);

});

let content = csv.map(e=>e.join(",")).join("\n");

let blob = new Blob(
[content],
{type:"text/csv;charset=utf-8;"}
);

let link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "FS_Ticket_Report.csv";
link.click();

}

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
