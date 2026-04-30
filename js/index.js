document.addEventListener("DOMContentLoaded", function () {

let data = [];
let noteTimer = {};

const body   = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   LOAD SERVER
========================= */
async function loadData(){

  try{
    const res = await window.syncEngine.loadAll();
    data = Array.isArray(res) ? res : [];
  }catch(err){
    console.log(err);
    data = [];
  }

  loadSummary();
  loadTable(search ? search.value : "");
}

/* =========================
   SUMMARY
========================= */
function loadSummary(){

  const tot      = document.getElementById("totTicket");
  const open     = document.getElementById("openTicket");
  const progress = document.getElementById("progressTicket");
  const close    = document.getElementById("closeTicket");
  const pending  = document.getElementById("pendingTicket");
  const mat      = document.getElementById("matCount");

  if(tot) tot.textContent = data.length;
  if(open) open.textContent = data.filter(x=>x.status=="Open").length;
  if(progress) progress.textContent = data.filter(x=>x.status=="Progress").length;
  if(close) close.textContent = data.filter(x=>x.status=="Close").length;
  if(pending) pending.textContent = data.filter(x=>x.status=="Pending").length;
  if(mat) mat.textContent = data.filter(x=>x.material && x.material.length > 0).length;
}

/* =========================
   TABLE
========================= */
function loadTable(filter=""){

  let k = (filter || "").toLowerCase();

  let rows = data.filter(x => {

    return (
      (x.customer || "").toLowerCase().includes(k) ||
      (x.project || "").toLowerCase().includes(k) ||
      (x.spk || "").toLowerCase().includes(k) ||
      (x.city || "").toLowerCase().includes(k)
    );

  });

  if(!body) return;

  body.innerHTML = rows.slice(-50).reverse().map((x,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${x.customer || ""}</td>
      <td>${x.project || ""}</td>
      <td>${x.spk || ""}</td>
      <td>${x.tanggal || ""}</td>
      <td>${x.city || ""}</td>

      <td>
        <select onchange="updateStatus('${x.id}',this.value)"
        style="padding:8px;border-radius:8px;border:1px solid #ddd;">

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
          style="width:170px;padding:8px;border:1px solid #ddd;border-radius:8px;">
      </td>

      <td>
        <div style="display:flex;gap:6px;justify-content:center;">

          <button onclick="openMaterialById('${x.id}')">📦</button>
          <button onclick="editTicketById('${x.id}')">✏️</button>
          <button onclick="hapusTicketById('${x.id}')">🗑️</button>

        </div>
      </td>

    </tr>
  `).join("");
}

/* =========================
   NOTE
========================= */
window.updateNote = function(id,val){

  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(async ()=>{

    await window.syncEngine.updateNote(id,val);
    await loadData();

  },500);
};

/* =========================
   STATUS
========================= */
window.updateStatus = async function(id,val){

  await window.syncEngine.updateStatus(id,val);
  await loadData();
};

/* =========================
   DELETE
========================= */
window.hapusTicketById = async function(id){

  if(!confirm("Hapus ticket ini?")) return;

  await window.syncEngine.deleteTicket(id);
  await loadData();
};

/* =========================
   EDIT
========================= */
window.editTicketById = async function(id){

  let x = data.find(t => t.id == id);
  if(!x) return;

  let customer = prompt("Customer",x.customer || "");
  let project  = prompt("Project",x.project || "");
  let spk      = prompt("SPK",x.spk || "");
  let city     = prompt("City",x.city || "");

  await window.syncEngine.updateTicket(id,{
    customer,
    project,
    spk,
    city
  });

  await loadData();
};

/* =========================
   MATERIAL
========================= */
window.openMaterialById = function(id){

  localStorage.setItem("activeTicketId",id);
  window.location.href = "material/material.html";
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
   EVENT REFRESH
========================= */
window.addEventListener("ticketsUpdated",loadData);

/* =========================
   INIT
========================= */
loadData();

setInterval(loadData,5000);

});
