document.addEventListener("DOMContentLoaded", function(){

const matBody = document.getElementById("matBody");
const search = document.getElementById("search");

/* =========================
   LOAD MATERIAL (SAFE)
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
   SAVE DATA (SAFE)
========================= */
function saveData(){
if(!Array.isArray(materials)) return;
localStorage.setItem("materialMaster", JSON.stringify(materials));
}

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
list = materials.filter(function(x){
return x.nama.toLowerCase().indexOf(filter.toLowerCase()) > -1;
});
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
<input 
type="number" 
value="${list[i].qty || 0}" 
min="0"
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
   UBAH QTY (SAFE)
========================= */
window.ubahQty = function(i,val){

if(!materials[i]) return;

materials[i].qty = Number(val);

saveData();
render(search.value);

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
nama:nama,
satuan:satuan,
harga:Number(harga),
qty:0
});

saveData();
render(search.value);

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

materials[i].nama = nama;
materials[i].satuan = satuan;
materials[i].harga = Number(harga);

saveData();
render(search.value);

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

}

};

/* =========================
   SEARCH
========================= */
search.addEventListener("input", function(){
render(this.value);
});

/* =========================
   AUTO SAVE (ANTI HILANG)
========================= */
window.addEventListener("beforeunload", function(){
saveData();
});

/* =========================
   INIT
========================= */
render("");

});
