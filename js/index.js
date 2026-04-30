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
========================= */
function saveNote(id,value){

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
      (x.city || "").toLowerCase().includes(k) ||
      (x.type || "").toLowerCase().includes(k)
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
      <td>${x.type || ""}</td>

      <td>
        <select onchange="updateStatus('${x.id}',this.value)"
        style="padding:8px;border-radius:10px;">
          <option value="">Pilih</option>
          <option value="Open" ${x.status=="Open"?"selected":""}>Open</option>
          <option value="Progress" ${x.status=="Progress"?"selected":""}>Progress</option>
          <option value="Close" ${x.status=="Close"?"selected":""}>Close</option>
          <option value="Pending" ${x.status=="Pending"?"selected":""}>Pending</option>
        </select>
      </td>

      <td>
        <input type="text"
        value="${x.note || ""}"
        onkeyup="updateNote('${x.id}',this.value)"
        style="width:170px;padding:8px;border-radius:10px;border:1px solid #ddd;">
      </td>

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
   MATERIAL
========================= */
window.openMaterialById = function(id){
  localStorage.setItem("activeTicketId",id);
  window.location.href = "material/material.html";
};

/* =========================
   EDIT POPUP MODAL
========================= */
window.editTicketById = function(id){

  let tickets = getLocal();
  let idx = tickets.findIndex(x => x.id == id);
  if(idx === -1) return;

  let x = tickets[idx];

  let old = document.getElementById("editPopup");
  if(old) old.remove();

  let html = `
  <div id="editPopup"
  style="
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.45);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:9999;">

    <div style="
      width:420px;
      max-width:95%;
      background:#fff;
      border-radius:18px;
      padding:25px;">

      <h2 style="margin-top:0;">Edit Ticket</h2>

      <input id="e_customer" value="${x.customer || ""}" placeholder="Customer"
      style="width:100%;padding:10px;margin-bottom:10px;">

      <input id="e_project" value="${x.project || ""}" placeholder="Project"
      style="width:100%;padding:10px;margin-bottom:10px;">

      <input id="e_spk" value="${x.spk || ""}" placeholder="SPK"
      style="width:100%;padding:10px;margin-bottom:10px;">

      <input id="e_city" value="${x.city || ""}" placeholder="City"
      style="width:100%;padding:10px;margin-bottom:10px;">

      <select id="e_type"
      style="width:100%;padding:10px;margin-bottom:15px;">
        <option value="Activation" ${x.type=="Activation"?"selected":""}>Activation</option>
        <option value="TroubleShooting" ${x.type=="TroubleShooting"?"selected":""}>TroubleShooting</option>
      </select>

      <div style="display:flex;gap:10px;justify-content:end;">

        <button onclick="document.getElementById('editPopup').remove()"
        style="padding:10px 16px;border:none;border-radius:10px;background:#ccc;">
        Cancel
        </button>

        <button onclick="saveEditTicket('${id}')"
        style="padding:10px 16px;border:none;border-radius:10px;background:#27ae60;color:#fff;">
        Save
        </button>

      </div>

    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
};

/* =========================
   SAVE EDIT
========================= */
window.saveEditTicket = function(id){

  let tickets = getLocal();
  let idx = tickets.findIndex(x => x.id == id);
  if(idx === -1) return;

  tickets[idx].customer = document.getElementById("e_customer").value;
  tickets[idx].project  = document.getElementById("e_project").value;
  tickets[idx].spk      = document.getElementById("e_spk").value;
  tickets[idx].city     = document.getElementById("e_city").value;
  tickets[idx].type     = document.getElementById("e_type").value;

  localStorage.setItem("tickets", JSON.stringify(tickets));

  document.getElementById("editPopup").remove();

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
