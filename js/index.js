document.addEventListener("DOMContentLoaded", function () {

let data = [];
let noteTimer = {};

/* =========================
   ELEMENT
========================= */
const body   = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   GET LOCAL
========================= */
function getLocal(){
  return JSON.parse(localStorage.getItem("tickets") || "[]");
}

/* =========================
   REFRESH
========================= */
function refreshData(){
  data = getLocal();
}

/* =========================
   SAVE NOTE
   SAVE NOTE (DELAY)
========================= */
function saveNote(id,value){
  let tickets = getLocal();
  let idx = tickets.findIndex(x => x.id == id);
  if(idx === -1) return;

  tickets[idx].note = value;
  localStorage.setItem("tickets", JSON.stringify(tickets));
  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(()=>{

    let tickets = getLocal();
    let idx = tickets.findIndex(x => x.id == id);
    if(idx === -1) return;

    tickets[idx].note = value;
    localStorage.setItem("tickets", JSON.stringify(tickets));

  },500);
}

/* =========================
   SAVE STATUS
========================= */
function saveStatus(id,value){

  let tickets = getLocal();
  let idx = tickets.findIndex(x => x.id == id);
  if(idx === -1) return;

  tickets[idx].status = value;
  localStorage.setItem("tickets", JSON.stringify(tickets));

  loadSummary();
}

/* =========================
   SUMMARY
========================= */
function loadSummary(){

  refreshData();

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
  if(mat) mat.textContent = data.filter(x => x.material && x.material.length > 0).length;
}

/* =========================
   TABLE
========================= */
function loadTable(filter=""){

  refreshData();

  let rows = data.filter(x=>{

    let k = filter.toLowerCase();

    return (
      (x.customer || "").toLowerCase().includes(k) ||
      (x.project || "").toLowerCase().includes(k) ||
      (x.spk || "").toLowerCase().includes(k) ||
      (x.city || "").toLowerCase().includes(k)
    );

  });

  if(!body) return;

  body.innerHTML = rows.slice(-50).reverse().map((x,i)=>{

    return `
    <tr>
      <td>${i+1}</td>
      <td>${x.customer || ""}</td>
      <td>${x.project || ""}</td>
      <td>${x.spk || ""}</td>
      <td>${x.tanggal || ""}</td>
      <td>${x.city || ""}</td>

      <!-- STATUS -->
      <td>
        <select
          onchange="updateStatus('${x.id}',this.value)"
          onfocus="this.style.color='#000'"
          onblur="if(this.value==''){this.style.color='#999'}"
          style="
            padding:7px 10px;
            min-width:120px;
            padding:8px 10px;
            min-width:125px;
            border-radius:10px;
            border:1px solid #ddd;
            color:${x.status ? '#000' : '#999'};
            cursor:pointer;
            background:#fff;">

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
          type="text"
          value="${x.note || ""}"
          placeholder="Isi note..."
          oninput="updateNote('${x.id}',this.value)"
          onkeyup="updateNote('${x.id}',this.value)"
          style="
            width:160px;
            padding:7px 10px;
            width:170px;
            padding:8px 10px;
            border:1px solid #ddd;
            border-radius:10px;">
      </td>

      <!-- AKSI -->
      <td>
        <div style="display:flex;gap:6px;justify-content:center;">

          <button onclick="openMaterialById('${x.id}')"
            style="border:none;padding:8px 10px;border-radius:10px;background:#3498db;color:#fff;cursor:pointer;">
            📦
          </button>

          <button onclick="editTicketById('${x.id}')"
            style="border:none;padding:8px 10px;border-radius:10px;background:#f39c12;color:#fff;cursor:pointer;">
            ✏️
          </button>

          <button onclick="hapusTicketById('${x.id}')"
            style="border:none;padding:8px 10px;border-radius:10px;background:#e74c3c;color:#fff;cursor:pointer;">
            🗑️
          </button>

        </div>
      </td>
    </tr>
    `;

  }).join("");
}

/* =========================
   UPDATE
========================= */
window.updateNote = function(id,val){
  saveNote(id,val);
};

window.updateStatus = function(id,val){
  saveStatus(id,val);
};

/* =========================
   SEARCH
========================= */
if(search){
  search.addEventListener("input",function(){
    loadTable(this.value);
  });
}

/* =========================
   OPEN MATERIAL
========================= */
window.openMaterialById = function(id){
  localStorage.setItem("activeTicketId",id);
  window.location.href = "material/material.html";
};

/* =========================
   EDIT
========================= */
window.editTicketById = function(id){

  let tickets = getLocal();
  let idx = tickets.findIndex(x => x.id == id);
  if(idx === -1) return;

  let x = tickets[idx];

  x.customer = prompt("Customer",x.customer) || x.customer;
  x.project  = prompt("Project",x.project) || x.project;
  x.spk      = prompt("SPK",x.spk) || x.spk;
  x.city     = prompt("City",x.city) || x.city;

  localStorage.setItem("tickets", JSON.stringify(tickets));

  loadSummary();
  loadTable(search ? search.value : "");
};

/* =========================
   DELETE
========================= */
window.hapusTicketById = function(id){

  if(!confirm("Hapus ticket ini?")) return;

  let tickets = getLocal();
  let idx = tickets.findIndex(x => x.id == id);
  if(idx === -1) return;

  tickets.splice(idx,1);

  localStorage.setItem("tickets", JSON.stringify(tickets));

  loadSummary();
  loadTable(search ? search.value : "");
};

/* =========================
   INIT
========================= */
window.addEventListener("ticketsUpdated",function(){
  loadSummary();
  loadTable(search ? search.value : "");
});

loadSummary();
loadTable();

});
