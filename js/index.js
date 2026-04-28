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
   SET DATA GLOBAL
========================= */
function refreshData(){
  data = getLocal();
}

/* =========================
   LOAD SUMMARY
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
   RENDER TABLE
========================= */
function loadTable(filter=""){

refreshData();

let rows = data.filter(x =>
(x.project || "").toLowerCase().includes(filter.toLowerCase())
);

body.innerHTML = rows.slice(-50).reverse().map((x,i)=>{

let index = data.indexOf(x);

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
<button class="icon-btn box-btn" onclick="openMaterial(${index})">📦</button>
<button class="icon-btn edit-btn" onclick="editTicket(${index})">✏️</button>
<button class="icon-btn del-btn" onclick="hapusTicket(${index})">🗑️</button>
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
   OPEN MATERIAL
========================= */
window.openMaterial = function(i){

let tickets = getLocal();
let t = tickets[i];

if(!t) return;

localStorage.setItem("activeTicketId", t.id);

window.location.href = "material/material.html";

};

/* =========================
   EDIT
========================= */
window.editTicket = function(i){

let tickets = getLocal();
let x = tickets[i];

if(!x) return;

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
window.hapusTicket = function(i){

if(confirm("Hapus ticket ini?")){

let tickets = getLocal();
tickets.splice(i,1);

localStorage.setItem("tickets", JSON.stringify(tickets));

loadSummary();
loadTable(search.value);

}

};

/* =========================
   AUTO SYNC EVENT (IMPORTANT)
========================= */
window.addEventListener("ticketsUpdated", function () {
loadSummary();
loadTable(search.value);
});

/* =========================
   INIT LOAD
========================= */
loadSummary();
loadTable();

});
