document.addEventListener("DOMContentLoaded", () => {

const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
const ticketSelect = document.getElementById("ticketSelect");
const matBody = document.getElementById("matBody");
const grandTotal = document.getElementById("grandTotal");
const search = document.getElementById("search");

const materials = [
 {nama:"Kabel Drop 2 Core", satuan:"meter", harga:0},
 {nama:"Drop Wire Furukawa", satuan:"meter", harga:5000},
 {nama:"Tiang 7 meter", satuan:"batang", harga:1400000},
 {nama:"Tiang 9 meter", satuan:"batang", harga:1650000},
 {nama:"Pipa PVC 3/4 inch", satuan:"batang", harga:35000},
 {nama:"RJ45 Cat 6", satuan:"pcs", harga:5000},
 {nama:"ONT", satuan:"pcs", harga:0},
 {nama:"Roset", satuan:"pcs", harga:0},
 {nama:"Splitter 1:2", satuan:"unit", harga:0},
 {nama:"Splitter 1:8", satuan:"unit", harga:0},
 {nama:"Splitter 1:16", satuan:"unit", harga:0},
 {nama:"ODP", satuan:"lot", harga:350000}
];

tickets.forEach((t,i)=>{
    ticketSelect.innerHTML += `<option value="${i}">${t.no} - ${t.customer}</option>`;
});

function rupiah(x){
    return Number(x).toLocaleString("id-ID");
}

function renderTable(filter=""){
    matBody.innerHTML = "";

    let no = 1;

    materials
    .filter(x => x.nama.toLowerCase().includes(filter.toLowerCase()))
    .forEach((m,i)=>{

        matBody.innerHTML += `
        <tr>
            <td>${no++}</td>
            <td>${m.nama}</td>
            <td>${m.satuan}</td>
            <td>${rupiah(m.harga)}</td>
            <td>
                <input type="number" min="0" value="0" class="qty"
                data-harga="${m.harga}"
                oninput="hitungTotal()">
            </td>
            <td class="lineTotal">0</td>
        </tr>
        `;
    });

    hitungTotal();
}

window.hitungTotal = function(){

    let qty = document.querySelectorAll(".qty");
    let line = document.querySelectorAll(".lineTotal");

    let total = 0;

    qty.forEach((q,i)=>{

        let harga = Number(q.dataset.harga);
        let jumlah = Number(q.value);
        let sub = harga * jumlah;

        line[i].innerText = rupiah(sub);

        total += sub;
    });

    grandTotal.innerText = rupiah(total);
}

window.saveMaterial = function(){

    let idx = ticketSelect.value;
    let data = JSON.parse(localStorage.getItem("tickets")) || [];

    let rows = document.querySelectorAll("#matBody tr");
    let detail = [];

    rows.forEach(r=>{

        let nama = r.cells[1].innerText;
        let satuan = r.cells[2].innerText;
        let harga = r.cells[3].innerText.replace(/\./g,'').replace(/,/g,'');
        let qty = r.querySelector(".qty").value;
        let total = r.cells[5].innerText.replace(/\./g,'').replace(/,/g,'');

        if(Number(qty) > 0){
            detail.push({
                nama:nama,
                satuan:satuan,
                harga:Number(harga),
                qty:Number(qty),
                total:Number(total)
            });
        }

    });

    data[idx].material = detail;
    data[idx].grandTotal = grandTotal.innerText;

    localStorage.setItem("tickets", JSON.stringify(data));

    alert("Material berhasil disimpan");
}

search.addEventListener("input", ()=>{
    renderTable(search.value);
});

renderTable();

});
