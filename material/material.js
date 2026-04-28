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
   SAVE
========================= */
function saveData(){
localStorage.setItem("materialMaster", JSON.stringify(materials));
}

/* =========================
   FORCE SAVE
========================= */
window.forceSave = function(){
saveData();
alert("Data berhasil disimpan!");
};

/* =========================
   FORMAT
========================= */
function rp(x){
return Number(x).toLocaleString("id-ID");
}

/* =========================
   RENDER
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

let total = list[i].harga * (list[i].qty || 0);

matBody.innerHTML += `
<tr>
<td>${i+1}</td>
<td>${list[i].nama}</td>
<td>${list[i].satuan}</td>
<td>${rp(list[i].harga)}</td>

<td>
<input type="number" value="${list[i].qty || 0}" min="0"
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
render(search.value);
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
render(search.value);
};

/* =========================
   DELETE
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
   INIT
========================= */
render("");

});
