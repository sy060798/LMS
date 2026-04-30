document.addEventListener("DOMContentLoaded", function () {

let data = [];
let noteTimer = {};

/* =========================
   SERVER
========================= */
const SERVER_URL = window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

/* =========================
   ELEMENT
========================= */
const body   = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   FETCH DATA SERVER
========================= */
async function loadData(){
  try {
    const res = await fetch(`${SERVER_URL}/tickets`);
    data = await res.json();

    loadSummary();
    loadTable(search ? search.value : "");

  } catch (err) {
    console.error("Gagal ambil data server:", err);
  }
}

/* =========================
   SAVE NOTE (SERVER)
========================= */
function saveNote(id,value){

  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(async ()=>{

    try {
      await fetch(`${SERVER_URL}/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: value })
      });

      loadData();

    } catch (err) {
      console.error("Gagal update note:", err);
    }

  },500);
}

/* =========================
   SAVE STATUS (SERVER)
========================= */
async function saveStatus(id,value){

  try {
    await fetch(`${SERVER_URL}/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value })
    });

    loadData();

  } catch (err) {
    console.error("Gagal update status:", err);
  }
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

      <td>${x.no || i+1}</td>
      <td>${x.customer || ""}</td>
      <td>${x.project || ""}</td>
      <td>${x.spk || ""}</td>
      <td>${x.tanggal || ""}</td>
      <td>${x.city || ""}</td>
      <td>${x.type || ""}</td>

      <td>
        <select onchange="updateStatus('${x.id}',this.value)">
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
        onkeyup="updateNote('${x.id}',this.value)">
      </td>

      <td>
        <div style="display:flex;gap:6px;justify-content:center;">

          <button onclick="openMaterialById('${x.id}')">📦</button>
          <button onclick="editTicketById('${x.id}')">✏️</button>
          <button onclick="hapusTicketById('${x.id}')">🗑️</button>

        </div>
      </td>

    </tr>
    `;
  }).join("");
}

/* =========================
   GLOBAL
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
   EDIT (SERVER PATCH)
========================= */
window.saveEditTicket = async function(id){

  try {
    await fetch(`${SERVER_URL}/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: e_customer.value,
        project: e_project.value,
        spk: e_spk.value,
        city: e_city.value,
        type: e_type.value
      })
    });

    document.getElementById("editPopup").remove();
    loadData();

  } catch (err) {
    console.error("Gagal edit:", err);
  }
};

/* =========================
   DELETE (SERVER)
========================= */
window.hapusTicketById = async function(id){

  if(!confirm("Hapus ticket ini?")) return;

  try {
    await fetch(`${SERVER_URL}/tickets/${id}`, {
      method: "DELETE"
    });

    loadData();

  } catch (err) {
    console.error("Gagal hapus:", err);
  }
};

/* =========================
   INIT
========================= */
loadData();

});
