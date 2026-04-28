document.addEventListener("DOMContentLoaded", function () {

let data = [];

/* =========================
   ELEMENT
========================= */
const body = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   GET LOCAL
========================= */
function getLocal(){
  return JSON.parse(localStorage.getItem("tickets") || "[]");
}

/* =========================
   REFRESH DATA
========================= */
function refreshData(){
  data = getLocal();
}

/* =========================
   SUMMARY
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
   TABLE RENDER (SAFE ID BASED)
========================= */
function loadTable(filter=""){

refreshData();

let rows = data.filter(x =>
(x.project || "").toLowerCase().includes(filter.toLowerCase())
);

body.innerHTML = rows.slice(-50).reverse().map((x,i)=>{

return `
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

<button class="icon-btn box-btn"
onclick="openMaterialById('${x.id}')">📦</button>

<button class="icon-btn edit-btn"
onclick="editTicketById('${x.id}')">✏️</button>

<button class="icon-btn del-btn"
onclick="hapusTicketById('${x.id}')">🗑️</button>

</div>
</td>
</tr>
`;

}).join("");

}

/* =========================
   SEARCH
========================= */
if(search){
search.addEventListener("input", function(){
loadTable(this.value);
});
}

/* =========================
   FIND BY ID (IMPORTANT FIX)
========================= */
function findIndexById(id){
  return data.findIndex(x => x.id === id);
}

/* =========================
   OPEN MATERIAL
========================= */
window.openMaterialById = function(id){

let tickets = getLocal();
let t = tickets.find(x => x.id == id);

if(!t) return;

localStorage.setItem("activeTicketId", t.id);

window.location.href = "material/material.html";

};

/* =========================
   EDIT
========================= */
window.editTicketById = function(id){

let tickets = getLocal();
let idx = findIndexById(id);

if(idx === -1) return;

let x = tickets[idx];

x.customer = prompt("Customer", x.customer) || x.customer;
x.project  = prompt("Project", x.project) || x.project;
x.spk      = prompt("SPK", x.spk) || x.spk;
x.city     = prompt("City", x.city) || x.city;
x.status   = prompt("Status", x.status) || x.status;

localStorage.setItem("tickets", JSON.stringify(tickets));

loadSummary();
loadTable(search.value);

};

/* =========================
   DELETE
========================= */
window.hapusTicketById = function(id){

if(!confirm("Hapus ticket ini?")) return;

let tickets = getLocal();
let idx = findIndexById(id);

if(idx === -1) return;

tickets.splice(idx,1);

localStorage.setItem("tickets", JSON.stringify(tickets));

loadSummary();
loadTable(search.value);

};

/* =========================
   SYNC UPDATE EVENT
========================= */
window.addEventListener("ticketsUpdated", function () {
loadSummary();
loadTable(search.value);
});

/* =========================
   INIT
========================= */
loadSummary();
loadTable();

});
