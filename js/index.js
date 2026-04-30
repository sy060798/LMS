document.addEventListener("DOMContentLoaded", function () {

let currentEditId = null;

/* =========================
   GET DATA
========================= */
function getData(){
  return window.syncEngine?.DB?.getTickets?.() || [];
}

/* =========================
   RENDER TABLE
========================= */
function render(){

  let data = getData();
  let body = document.getElementById("ticketBody");

  body.innerHTML = data.map((x,i)=>`

    <tr>
      <td>${i+1}</td>
      <td><b>${x.spk}</b></td>
      <td>${x.customer}</td>
      <td>${x.project}</td>
      <td>${x.tanggal}</td>
      <td>${x.city}</td>
      <td>${x.type}</td>

      <td>
        <select onchange="updateStatus('${x.id}',this.value)">
          <option ${x.status=="Open"?"selected":""}>Open</option>
          <option ${x.status=="Progress"?"selected":""}>Progress</option>
          <option ${x.status=="Close"?"selected":""}>Close</option>
          <option ${x.status=="Pending"?"selected":""}>Pending</option>
        </select>
      </td>

      <td>
        <input value="${x.note||""}" 
        oninput="updateNote('${x.id}',this.value)">
      </td>

      <td>
        <button onclick="openEdit('${x.id}')">✏️</button>
        <button onclick="deleteTicket('${x.id}')">🗑️</button>
      </td>

    </tr>

  `).join("");
}

/* =========================
   UPDATE NOTE
========================= */
window.updateNote = function(id,val){
  window.syncEngine.updateTicket(id,t=>{
    t.note = val;
    return t;
  });
};

/* =========================
   STATUS
========================= */
window.updateStatus = function(id,val){
  window.syncEngine.updateTicket(id,t=>{
    t.status = val;
    return t;
  });

  window.syncEngine.saveAll();
};

/* =========================
   OPEN EDIT POPUP
========================= */
window.openEdit = function(id){

  let data = getData();
  let x = data.find(t=>t.id===id);

  currentEditId = id;

  document.getElementById("e_customer").value = x.customer;
  document.getElementById("e_project").value = x.project;
  document.getElementById("e_spk").value = x.spk;
  document.getElementById("e_city").value = x.city;

  document.getElementById("editPopup").style.display = "flex";
};

/* =========================
   SAVE EDIT
========================= */
window.saveEdit = function(){

  let data = getData();

  let customer = e_customer.value;
  let project  = e_project.value;
  let spk      = e_spk.value;
  let city     = e_city.value;

  if(!spk) return alert("SPK wajib");

  let dup = data.some(t => t.id!==currentEditId && t.spk===spk);

  if(dup) return alert("SPK sudah dipakai");

  window.syncEngine.updateTicket(currentEditId,t=>{
    t.customer = customer;
    t.project = project;
    t.spk = spk;
    t.city = city;
    return t;
  });

  window.syncEngine.saveAll();

  closeEdit();
  render();
};

/* =========================
   CLOSE POPUP
========================= */
window.closeEdit = function(){
  document.getElementById("editPopup").style.display = "none";
};

/* =========================
   DELETE
========================= */
window.deleteTicket = function(id){
  if(!confirm("Hapus?")) return;

  window.syncEngine.deleteTicket(id);
  window.syncEngine.saveAll();
  render();
};

/* =========================
   SYNC EVENT
========================= */
window.addEventListener("ticketsUpdated", render);

/* =========================
   INIT
========================= */
render();

});
