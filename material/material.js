document.addEventListener("DOMContentLoaded", function () {

const SERVER_URL = window.SERVER_URL || "";

/* =========================
   ELEMENT POPUP
========================= */
let popup = document.createElement("div");
popup.id = "materialPopup";
popup.style.cssText = `
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.6);
display:none;
justify-content:center;
align-items:center;
z-index:9999;
`;

popup.innerHTML = `
<div style="
background:#fff;
width:90%;
max-width:1000px;
max-height:90vh;
overflow:auto;
border-radius:12px;
padding:15px;
box-shadow:0 10px 30px rgba(0,0,0,.3)
">

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
<h3>📦 Material List</h3>
<button onclick="closeMaterialPopup()" style="background:red;color:#fff;border:none;padding:8px 12px;border-radius:6px">Tutup</button>
</div>

<input id="search" placeholder="Cari material..." style="width:100%;padding:10px;margin-bottom:10px">

<table style="width:100%;border-collapse:collapse;font-size:13px">
<thead>
<tr>
<th>No</th>
<th>Nama</th>
<th>Satuan</th>
<th>Harga</th>
<th>Qty</th>
<th>Total</th>
</tr>
</thead>
<tbody id="matBody"></tbody>
</table>

</div>
`;

document.body.appendChild(popup);

/* =========================
   MASTER DATA
========================= */
const MASTER_MATERIAL = [
  { nama: "Kabel Udara ADSS Span 100 12 Core", satuan: "Meter", harga: 10000 },
  { nama: "Kabel Udara ADSS Span 100 24 Core", satuan: "Meter", harga: 12000 },
  { nama: "Kabel Udara ADSS Span 100 48 Core", satuan: "Meter", harga: 17500 },
  { nama: "Kabel Udara ADSS Span 100 96 Core", satuan: "", harga: 20000 },

  { nama: "Join Closure Dome 12 Core", satuan: "Unit", harga: 750000 },
  { nama: "Join Closure Dome 48 Core + Label ID", satuan: "Set", harga: 1250000 },
  { nama: "Join Closure Dome 96 Core", satuan: "Set", harga: 2500000 },

  { nama: "Splitter 1:2", satuan: "Unit", harga: 350000 },
  { nama: "Splitter 1:4", satuan: "Unit", harga: 450000 },
  { nama: "Splitter 1:8", satuan: "Unit", harga: 600000 },
  { nama: "Splitter 1:16", satuan: "Unit", harga: 800000 },

  { nama: "Drop Wire Furukawa", satuan: "Meter", harga: 5000 },
  { nama: "Kabel LAN", satuan: "Unit", harga: 5000 },
  { nama: "Lakban", satuan: "Pcs", harga: 10000 }
];

/* =========================
   DB LOCAL
========================= */
const DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),
  saveTickets: (d) => localStorage.setItem("tickets", JSON.stringify(d)),
};

/* =========================
   ACTIVE TICKET
========================= */
function getTicket(){
  let id = localStorage.getItem("activeTicketId");
  return DB.getTickets().find(t => t.id == id);
}

/* =========================
   MATERIAL STATE
========================= */
let materials = [];

/* =========================
   OPEN POPUP
========================= */
window.openMaterialPopup = function(){

  let ticket = getTicket();
  materials = JSON.parse(JSON.stringify(MASTER_MATERIAL));

  // load qty existing
  if(ticket?.material){
    materials = materials.map(m => {
      let old = ticket.material.find(x => x.nama === m.nama);
      return {
        ...m,
        qty: old ? old.qty : 0
      };
    });
  }

  popup.style.display = "flex";
  render("");
};

/* =========================
   CLOSE POPUP
========================= */
window.closeMaterialPopup = function(){
  popup.style.display = "none";
};

/* =========================
   COMMIT SAVE
========================= */
function commit(){

  let ticket = getTicket();
  if(!ticket) return;

  ticket.material = materials
    .filter(m => Number(m.qty) > 0);

  let all = DB.getTickets();
  let i = all.findIndex(t => t.id == ticket.id);

  if(i >= 0){
    all[i] = ticket;
    DB.saveTickets(all);
  }
}

/* =========================
   RENDER
========================= */
function render(filter=""){

  let body = document.getElementById("matBody");
  body.innerHTML = "";

  let list = materials.filter(x =>
    x.nama.toLowerCase().includes(filter.toLowerCase())
  );

  list.forEach((m,i)=>{

    let total = Number(m.qty||0) * Number(m.harga||0);

    body.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${m.nama}</td>
        <td>${m.satuan}</td>

        <td>
          <input type="number" value="${m.harga}" disabled>
        </td>

        <td>
          <input type="number" value="${m.qty||0}" min="0"
          onchange="setQty(${i},this.value)">
        </td>

        <td>${total.toLocaleString("id-ID")}</td>
      </tr>
    `;
  });
}

/* =========================
   SET QTY
========================= */
window.setQty = function(i,val){
  materials[i].qty = Number(val);
  commit();
  render(document.getElementById("search").value || "");
};

/* =========================
   SEARCH
========================= */
document.addEventListener("input", function(e){
  if(e.target.id === "search"){
    render(e.target.value);
  }
});

});
