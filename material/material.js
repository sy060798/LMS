document.addEventListener("DOMContentLoaded", function () {

const matBody = document.getElementById("matBody");
const search = document.getElementById("search");

if(!matBody) return;

/* =========================
   LOAD TICKET + MATERIAL
========================= */
let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
let activeId = localStorage.getItem("activeTicketId");

let ticket = tickets.find(t => t.id == activeId);

/* MATERIAL PER TICKET */
let materials = ticket?.material ? [...ticket.material] : [];

/* =========================
   SAVE LOCAL
========================= */
function saveData(){
  if(ticket){
    ticket.material = materials;
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }
}

/* =========================
   SYNC KE TICKET (FINAL DATA ONLY > 0)
========================= */
function syncToTicket(){
  if(ticket){
    ticket.material = materials.filter(m => Number(m.qty) > 0);
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }
}

/* =========================
   COMMIT (RECOMMENDED)
========================= */
function commit(){
  saveData();
  syncToTicket();
}

/* =========================
   FORMAT RUPIAH
========================= */
function rp(x){
  return Number(x || 0).toLocaleString("id-ID");
}

/* =========================
   RENDER TABLE
========================= */
function render(filter=""){

matBody.innerHTML = "";

let list = materials
.map((m,i)=>({...m,_i:i}))
.filter(x =>
  !filter || x.nama.toLowerCase().includes(filter.toLowerCase())
);

list.forEach((item,i)=>{

let total = Number(item.harga) * Number(item.qty || 0);

matBody.innerHTML += `
<tr>
<td>${i+1}</td>
<td>${item.nama}</td>
<td>${item.satuan}</td>
<td>${rp(item.harga)}</td>

<td>
<input type="number" value="${item.qty || 0}" min="0"
style="width:70px;padding:5px"
onchange="ubahQty(${item._i},this.value)">
</td>

<td>${rp(total)}</td>

<td>
<span onclick="editMaterial(${item._i})">✏️</span>
<span onclick="hapusMaterial(${item._i})">🗑️</span>
</td>
</tr>
`;

});

}

/* =========================
   QTY CHANGE
========================= */
window.ubahQty = function(i,val){

if(!materials[i]) return;

materials[i].qty = Number(val);

commit();
render(search?.value || "");

};

/* =========================
   ADD MATERIAL
========================= */
window.addMaterial = function(){

let nama = prompt("Nama Material");
if(!nama) return;

let satuan = prompt("Satuan");
if(!satuan) return;

let harga = prompt("Harga");
if(harga === null) return;

materials.push({
  nama,
  satuan,
  harga:Number(harga),
  qty:0
});

commit();
render(search?.value || "");

};

/* =========================
   EDIT MATERIAL
========================= */
window.editMaterial = function(i){

let x = materials[i];
if(!x) return;

let nama = prompt("Nama", x.nama);
if(!nama) return;

let satuan = prompt("Satuan", x.satuan);
if(!satuan) return;

let harga = prompt("Harga", x.harga);
if(harga === null) return;

materials[i] = {
  ...x,
  nama,
  satuan,
  harga:Number(harga)
};

commit();
render(search?.value || "");

};

/* =========================
   DELETE MATERIAL
========================= */
window.hapusMaterial = function(i){

if(!materials[i]) return;

if(confirm("Hapus material ini?")){
materials.splice(i,1);
commit();
render(search?.value || "");
}

};

/* =========================
   SEARCH
========================= */
if(search){
search.addEventListener("input", function(){
render(this.value);
});
}

/* =========================
   FORCE SAVE BUTTON
========================= */
window.forceSave = function(){
commit();
alert("✔ Material berhasil disimpan ke ticket");
};

/* =========================
   AUTO SAVE BEFORE CLOSE
========================= */
window.addEventListener("beforeunload", function(){
commit();
});

/* =========================
   INIT
========================= */
render("");

});
