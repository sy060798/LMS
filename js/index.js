document.addEventListener("DOMContentLoaded", function () {

const SERVER_URL =
window.SERVER_URL || "https://tracking-server-production-6a12.up.railway.app";

let data = [];
let noteTimer = {};

/* =========================
   ELEMENT
========================= */
const body   = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   LOAD FROM SERVER
========================= */
async function loadData(){

  try{

    let res = await fetch(SERVER_URL + "/api/get?type=LMS&_=" + Date.now());

    let json = await res.json();

    data = Array.isArray(json) ? json : [];

    loadSummary();
    loadTable(search ? search.value : "");

  }catch(err){
    console.log(err);
  }
}

/* =========================
   SAVE NOTE (SERVER)
========================= */
function saveNote(id,value){

  clearTimeout(noteTimer[id]);

  noteTimer[id] = setTimeout(async ()=>{

    let ticket = data.find(x => x.id == id);
    if(!ticket) return;

    ticket.note = value;

    await syncToServer();

  },500);
}

/* =========================
   SAVE STATUS (SERVER)
========================= */
async function saveStatus(id,value){

  let ticket = data.find(x => x.id == id);
  if(!ticket) return;

  ticket.status = value;

  await syncToServer();

  loadSummary();
}

/* =========================
   SYNC KE SERVER (FULL REPLACE)
========================= */
async function syncToServer(){

  try{

    let res = await fetch(SERVER_URL + "/api/save", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        type: "LMS",
        data: data
      })
    });

    if(!res.ok){
      console.log("Gagal sync server");
    }

  }catch(err){
    console.log(err);
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
        <button onclick="hapusTicketById('${x.id}')">🗑️</button>
      </td>

    </tr>`;
  }).join("");
}

/* =========================
   GLOBAL FUNCTION
========================= */
window.updateNote = function(id,val){
  saveNote(id,val);
};

window.updateStatus = function(id,val){
  saveStatus(id,val);
};

/* =========================
   DELETE (SERVER)
========================= */
window.hapusTicketById = async function(id){

  if(!confirm("Hapus ticket ini?")) return;

  data = data.filter(x => x.id != id);

  await syncToServer();

  loadSummary();
  loadTable(search ? search.value : "");
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
   INIT
========================= */
loadData();

});
