document.addEventListener("DOMContentLoaded", function(){

const matBody = document.getElementById("matBody");
const search = document.getElementById("search");

if(!matBody) return;

/* =========================
   LOAD MATERIAL
========================= */
let materials = JSON.parse(localStorage.getItem("materialMaster") || "null");

if(!materials || !Array.isArray(materials)){
materials = [
{nama:"Kabel Drop 2 Core",satuan:"meter",harga:0,qty:0},
{nama:"Drop Wire Furukawa",satuan:"meter",harga:5000,qty:0},
{nama:"Tiang 7 meter",satuan:"batang",harga:1400000,qty:0},
{nama:"Tiang 9 meter",satuan:"batang",harga:1650000,qty:0},
{nama:"RJ45 Cat 6",satuan:"pcs",harga:5000,qty:0},
{nama:"OTB 12 Core",satuan:"unit",harga:1100000,qty:0},
{nama:"Transportasi",satuan:"lot",harga:250000,qty:0}
];
saveData();
}

/* =========================
   SAVE
========================= */
function saveData(){
localStorage.setItem("materialMaster", JSON.stringify(materials));
}

/* =========================
   SYNC KE TICKET (SAFE)
========================= */
function syncToTicket(){

let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
let activeId = localStorage.getItem("activeTicketId");

if(!activeId) return;

let t = tickets.find(x => x.id == activeId);
if(!t) return;

t.material = materials.filter(m => Number(m.qty) > 0);

localStorage.setItem("tickets", JSON.stringify(tickets));
}

/* =========================
   FORMAT
========================= */
function rp(x){
return Number(x).toLocaleString("id-ID");
}

/* =========================
   RENDER (FIX INDEX BUG)
========================= */
function render(filter){

matBody.innerHTML = "";

let list = materials
.map((m, idx) => ({...m, _idx: idx}))
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
onchange="ubahQty(${item._idx},this.value)">
</td>

<td>${rp(total)}</td>

<td>
<span class="action" onclick="editMaterial(${item._idx})">✏️</span>
<span class="action" onclick="hapusMaterial(${item._idx})">🗑️</span>
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

saveData();
render(search?.value || "");
syncToTicket();

};

/* =========================
   ADD
========================= */
window.addMaterial = function(){

let nama = prompt("Nama Material");
if(!nama) return;

let satuan = prompt("Satuan");
if(!satuan) return;

let harga = prompt("Harga");
if(harga===null) return;

materials.push({
nama,
satuan,
harga:Number(harga),
qty:0
});

saveData();
render(search?.value || "");
syncToTicket();

};

/* =========================
   EDIT
========================= */
window.editMaterial = function(i){

let x = materials[i];
if(!x) return;

let nama = prompt("Nama Material", x.nama);
if(!nama) return;

let satuan = prompt("Satuan", x.satuan);
if(!satuan) return;

let harga = prompt("Harga", x.harga);
if(harga===null) return;

materials[i] = { ...x, nama, satuan, harga:Number(harga) };

saveData();
render(search?.value || "");
syncToTicket();

};

/* =========================
   DELETE
========================= */
window.hapusMaterial = function(i){

if(!materials[i]) return;

if(confirm("Hapus material ini?")){
materials.splice(i,1);
saveData();
render(search?.value || "");
syncToTicket();
}

};

/* =========================
   SEARCH SAFE
========================= */
if(search){
search.addEventListener("input", function(){
render(this.value);
});
}

/* =========================
   CLOSE SAVE SAFE
========================= */
window.addEventListener("beforeunload", function(){

try{

saveData();
syncToTicket();

if(typeof SERVER_URL !== "undefined"){
navigator.sendBeacon(
SERVER_URL + "/saveSync",
JSON.stringify({
material: materials.filter(m => Number(m.qty) > 0),
tickets: JSON.parse(localStorage.getItem("tickets") || "[]")
})
);
}

}catch(e){}

});

/* =========================
   INIT
========================= */
render("");

});
