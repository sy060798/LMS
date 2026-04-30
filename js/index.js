document.addEventListener("DOMContentLoaded", function () {

let data = [];

/* =========================
   ELEMENT
========================= */
const body   = document.getElementById("ticketBody");
const search = document.getElementById("searchCustomer");

/* =========================
   GET DATA
========================= */
function getData(){
  return window.syncEngine?.DB?.getTickets?.() || [];
}

/* =========================
   SUMMARY
========================= */
function loadSummary(){

  let data = getData();

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
   TABLE RENDER
========================= */
function loadTable(filter=""){

  let data = getData();
  let k = filter.toLowerCase();

  let rows = data.filter(x => (
    (x.customer || "").toLowerCase().includes(k) ||
    (x.project || "").toLowerCase().includes(k) ||
    (x.spk || "").toLowerCase().includes(k) ||
    (x.city || "").toLowerCase().includes(k) ||
    (x.type || "").toLowerCase().includes(k)
  ));

  if(!body) return;

  body.innerHTML = rows.slice(-50).reverse().map((x, i) => {

    return `
    <tr>

      <!-- HEADER NO (UI ONLY) -->
      <td>${i + 1}</td>

      <!-- SPK = PRIMARY ID -->
      <td><b>${x.spk || "-"}</b></td>

      <td>${x.customer || ""}</td>
      <td>${x.project || ""}</td>
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
          oninput="updateNote('${x.id}',this.value)">
      </td>

      <!-- ACTION -->
      <td>
        <div style="display:flex;gap:6px;justify-content:center;">
          <button onclick="openMaterialById('${x.id}')">📦</button>
          <button onclick="openEditPopup('${x.id}')">✏️</button>
          <button onclick="hapusTicketById('${x.id}')">🗑️</button>
        </div>
      </td>

    </tr>
    `;
  }).join("");
}

/* =========================
   NOTE
========================= */
window.updateNote = function(id,val){

  window.syncEngine.updateTicket(id, t => {
    t.note = val;
    return t;
  });

};

/* =========================
   STATUS
========================= */
window.updateStatus = function(id,val){

  window.syncEngine.updateTicket(id, t => {
    t.status = val;
    return t;
  });

  window.syncEngine.saveAll();
};

/* =========================
   POPUP EDIT (PENSIL)
========================= */
window.openEditPopup = function(id){

  let data = getData();
  let x = data.find(t => t.id == id);
  if(!x) return;

  let popup = prompt(
`EDIT TICKET

Customer: ${x.customer}
Project : ${x.project}
SPK     : ${x.spk}
City    : ${x.city}

➡ isi baru (pisahkan pakai | )
format: customer|project|spk|city`
  );

  if(!popup) return;

  let [customer, project, spk, city] = popup.split("|");

  if(!spk) return alert("SPK wajib");

  let duplicate = data.some(t =>
    t.id !== id && (t.spk || "").toLowerCase() === spk.toLowerCase()
  );

  if(duplicate){
    alert("❌ SPK sudah dipakai!");
    return;
  }

  window.syncEngine.updateTicket(id, t => {
    t.customer = customer?.trim() || t.customer;
    t.project  = project?.trim() || t.project;
    t.spk      = spk?.trim();
    t.city     = city?.trim() || t.city;
    return t;
  });

  window.syncEngine.saveAll();
};

/* =========================
   DELETE
========================= */
window.hapusTicketById = function(id){

  if(!confirm("Hapus ticket ini?")) return;

  window.syncEngine.deleteTicket(id);
  window.syncEngine.saveAll();
};

/* =========================
   MATERIAL
========================= */
window.openMaterialById = function(id){
  sessionStorage.setItem("activeTicketId",id);
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
   SYNC EVENT
========================= */
window.addEventListener("ticketsUpdated", () => {
  loadSummary();
  loadTable(search ? search.value : "");
});

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  loadSummary();
  loadTable();
});

});
