document.addEventListener("DOMContentLoaded", function(){

const matBody = document.getElementById("matBody");
const search = document.getElementById("search");

let materials = JSON.parse(localStorage.getItem("materialMaster"));

if(!materials){

materials = [

{nama:"Kabel Drop 2 Core",satuan:"meter",harga:0},
{nama:"Drop Wire Furukawa",satuan:"meter",harga:5000},
{nama:"Tiang 7 meter",satuan:"batang",harga:1400000},
{nama:"Tiang 9 meter",satuan:"batang",harga:1650000},
{nama:"RJ45 Cat 6",satuan:"pcs",harga:5000},
{nama:"OTB 12 Core",satuan:"unit",harga:1100000},
{nama:"Transportasi",satuan:"lot",harga:250000}

];

saveData();

}

function saveData(){
localStorage.setItem("materialMaster", JSON.stringify(materials));
}

function rp(x){
return Number(x).toLocaleString("id-ID");
}

function render(filter){

matBody.innerHTML = "";

let list = materials;

if(filter){
list = materials.filter(function(x){
return x.nama.toLowerCase().indexOf(filter.toLowerCase()) > -1;
});
}

for(let i=0;i<list.length;i++){

matBody.innerHTML += `
<tr>
<td>${i+1}</td>
<td>${list[i].nama}</td>
<td>${list[i].satuan}</td>
<td>${rp(list[i].harga)}</td>
<td>
<span class="action" onclick="editMaterial(${i})">✏️</span>
<span class="action" onclick="hapusMaterial(${i})">🗑️</span>
</td>
</tr>
`;

}

}

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
harga:Number(harga)
});

saveData();
render(search.value);

}

window.editMaterial = function(i){

let x = materials[i];

let nama = prompt("Nama Material", x.nama);
if(!nama) return;

let satuan = prompt("Satuan", x.satuan);
if(!satuan) return;

let harga = prompt("Harga", x.harga);
if(harga===null) return;

materials[i] = {
nama:nama,
satuan:satuan,
harga:Number(harga)
};

saveData();
render(search.value);

}

window.hapusMaterial = function(i){

if(confirm("Hapus material ini?")){

materials.splice(i,1);

saveData();
render(search.value);

}

}

search.addEventListener("input", function(){
render(this.value);
});

render("");

});
