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
   SAVE NOTE
========================= */
function saveNote(id, value){
  let tickets = getLocal();
  let idx = tickets.findIndex(x => x.id == id);

  if(idx === -1) return;

  tickets[idx].note = value;
  localStorage.setItem("tickets", JSON.stringify(tickets));
}

/* =========================
   SUMMARY
========================= */
function loadSummary(){

  refreshData();

  const tot   = document.getElementById("totTicket");
  const open  = document.getElementById("openTicket");
  const close = document.getElementById("closeTicket");
  const mat   = document.getElementById("matCount");

  if(tot) tot.textContent = data.length;

  if(open){
    open.textContent =
      data.filter(x => (x.status || "").toLowerCase() === "open").length;
  }

  if(close){
    close.textContent =
      data.filter(x => (x.status || "").toLowerCase() === "close").length;
  }

  if(mat){
    mat.textContent =
      data.filter(x => x.material && x.material.length > 0).length;
  }
}

/* =========================
   TABLE RENDER
========================= */
function loadTable(filter = ""){

  refreshData();

  let rows = data.filter(x => {
    let key = filter.toLowerCase();

    return (
      (x.customer || "").toLowerCase().includes(key) ||
      (x.project || "").toLowerCase().includes(key) ||
      (x.spk || "").toLowerCase().includes(key) ||
      (x.city || "").toLowerCase().includes(key)
    );
  });

  if(!body) return;

  body.innerHTML = rows.slice(-50).reverse().map((x,i)=>{

    let status = (x.status || "").toLowerCase();

    let color = "#999";

    if(status === "open") color = "#e74c3c";
    if(status === "close") color = "#27ae60";
    if(status === "progress") color = "#f39c12";

    return `
    <tr>
      <td>${i+1}</td>
      <td>${x.customer || ""}</td>
      <td>${x.project || ""}</td>
      <td>${x.spk || ""}</td>
      <td>${x.tanggal || ""}</td>
      <td>${x.city || ""}</td>

      <td>
        <span class="status"
          style="
            background:${color};
            color:#fff;
            padding:4px 10px;
            border-radius:20px;
            font-size:12px;
            font-weight:bold;">
          ${x.status || ""}
        </span>
      </td>

      <td>
        <input
          type="text"
          value="${x.note || ""}"
          placeholder="Isi note..."
          oninput="updateNote('${x.id}', this.value)"
          style="
            width:150px;
            padding:6px;
            border:1px solid #ccc;
            border-radius:8px;">
      </td>

      <td>
        <div class="aksi">

          <button type="button"
            class="icon-btn box-btn"
            onclick="openMaterialById('${x.id}')">
            📦
          </button>

          <button type="button"
            class="icon-btn edit-btn"
            onclick="editTicketById('${x.id}')">
            ✏️
          </button>

          <button type="button"
            class="icon-btn del-btn"
            onclick="hapusTicketById('${x.id}')">
            🗑️
          </button>

        </div>
      </td>
    </tr>
    `;

  }).join("");
}

/* =========================
   UPDATE NOTE
========================= */
window.updateNote = function(id,val){
  saveNote(id,val);
};

/* =========================
   SEARCH
========================= */
if(search){
  search.addEventListener("input", function(){
    loadTable(this.value);
  });
}

/* =========================
   FIND INDEX
========================= */
function findIndexById(id){
  refreshData();
  return data.findIndex(x => x.id == id);
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
  let idx = tickets.findIndex(x => x.id == id);

  if(idx === -1) return;

  let x = tickets[idx];

  x.customer = prompt("Customer", x.customer) || x.customer;
  x.project  = prompt("Project", x.project) || x.project;
  x.spk      = prompt("SPK", x.spk) || x.spk;
  x.city     = prompt("City", x.city) || x.city;
  x.status   = prompt("Status", x.status) || x.status;

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
   EVENT REFRESH
========================= */
window.addEventListener("ticketsUpdated", function () {
  loadSummary();
  loadTable(search ? search.value : "");
});

/* =========================
   INIT
========================= */
loadSummary();
loadTable();

});
