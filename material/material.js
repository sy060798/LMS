document.addEventListener("DOMContentLoaded", function(){

const matBody = document.getElementById("matBody");
const search = document.getElementById("search");

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
   SAVE MATERIAL MASTER
========================= */
function saveData(){
localStorage.setItem("materialMaster", JSON.stringify(materials));
}

/* =========================
   SYNC KE TICKET (🔥 FIX UTAMA)
========================= */
function syncToTicket(){

let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
let activeId = localStorage.getItem("activeTicketId");

if(!activeId) return;

let t = tickets.find(x => x.id == activeId);

if(!t) return;

t.material = materials;

localStorage.setItem("tickets", JSON.stringify(tickets));
}

/* =========================
   FORCE SAVE
========================= */
window.forceSave = function(){
saveData();
syncToTicket();
alert("Data berhasil disimpan!");
};

/* =========================
   FORMAT RUPIAH
========================= */
function rp(x){
return Number(x).toLocaleString("id-ID");
}

/* =========================
   RENDER TABLE
========================= */
function render(filter){

matBody.innerHTML = "";

let list = materials;

if(filter){
list = materials.filter(x =>
x.nama.toLowerCase().includes(filter.toLowerCase())
);
}

for(let i=0;i<list.length;i++){

let total = Number(list[i].harga) * Number(list[i].qty || 0);

matBody.innerHTML += `
<tr>
<td>${i+1}</td>
<td>${list[i].nama}</td>
<td>${list[i].satuan}</td>
<td>${rp(list[i].harga)}</td>

<td>
<input type="number" value="${list[i].qty || 0}" min="0"
style="width:70px;padding:5px"
onchange="ubahQty(${i},this.value)">
</td>

<td>${rp(total)}</td>

<td>
<span class="action" onclick="editMaterial(${i})">✏️</span>
<span class="action" onclick="hapusMaterial(${i})">🗑️</span>
</td>
</tr>
`;
}

}

/* =========================
   UBAH QTY
========================= */
window.ubahQty = function(i,val){

if(!materials[i]) return;

materials[i].qty = Number(val);

saveData();
render(search.value);

/* 🔥 AUTO SYNC KE TICKET */
syncToTicket();

};

/* =========================
   TAMBAH MATERIAL
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
render(search.value);

/* SYNC */
syncToTicket();

};

/* =========================
   EDIT MATERIAL
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
render(search.value);

/* SYNC */
syncToTicket();

};

/* =========================
   HAPUS MATERIAL
========================= */
window.hapusMaterial = function(i){

if(!materials[i]) return;

if(confirm("Hapus material ini?")){

materials.splice(i,1);

saveData();
render(search.value);

/* SYNC */
syncToTicket();

}

};

/* =========================
   SEARCH
========================= */
search.addEventListener("input", function(){
render(this.value);
});

/* =========================
   AUTO SAVE SAAT CLOSE
========================= */
window.addEventListener("beforeunload", function(){
saveData();
syncToTicket();
});

/* =========================
   INIT
========================= */
render("");

});
