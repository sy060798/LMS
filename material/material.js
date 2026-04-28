document.addEventListener("DOMContentLoaded", function () {

/* =========================
   POPUP
========================= */
let popup = document.getElementById("materialPopup");

if(!popup){
  popup = document.createElement("div");
  popup.id = "materialPopup";
  popup.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.6);
    display:none;
    justify-content:center;
    align-items:center;
    z-index:9999;
  `;

  popup.innerHTML = `
    <div style="background:#fff;width:95%;max-width:1100px;border-radius:12px;padding:15px;max-height:90vh;overflow:auto">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <h3>📦 Material Ticket</h3>
        <button onclick="closeMaterialPopup()" style="background:red;color:#fff;border:none;padding:6px 10px;border-radius:6px">Tutup</button>
      </div>

      <input id="matSearch" placeholder="Cari material..." style="width:100%;padding:10px;margin-bottom:10px">

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
}

/* =========================
   MASTER DATA
========================= */
const MASTER_MATERIAL = [
  { nama: "Kabel Udara ADSS Span 100 12 Core", satuan: "Meter", harga: 10000 },
  { nama: "Kabel Udara ADSS Span 100 24 Core", satuan: "Meter", harga: 12000 },
  { nama: "Kabel Udara ADSS Span 100 48 Core", satuan: "Meter", harga: 17500 },
  { nama: "Kabel Udara ADSS Span 100 96 Core", satuan: "", harga: 20000 },
  { nama: "Splitter 1:8", satuan: "Unit", harga: 600000 },
  { nama: "Drop Wire Furukawa", satuan: "Meter", harga: 5000 },
  { nama: "Kabel LAN", satuan: "Unit", harga: 5000 },
  { nama: "Lakban", satuan: "Pcs", harga: 10000 }
];

/* =========================
   DB
========================= */
const DB = {
  get: () => JSON.parse(localStorage.getItem("tickets") || "[]"),
  save: (d) => localStorage.setItem("tickets", JSON.stringify(d))
};

/* =========================
   GET TICKET
========================= */
function getTicket(){
  let id = localStorage.getItem("activeTicketId");
  return DB.get().find(t => t.id == id);
}

/* =========================
   STATE
========================= */
let materials = [];
let saveTimer;

/* =========================
   OPEN POPUP
========================= */
window.openMaterialPopup = function(){

  let ticket = getTicket();
  materials = JSON.parse(JSON.stringify(MASTER_MATERIAL));

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
   CLOSE POPUP (AUTO SAVE)
========================= */
window.closeMaterialPopup = function(){
  commit(); // 🔥 penting biar tidak hilang
  popup.style.display = "none";
};

/* =========================
   SAVE (DEBOUNCE SAFE)
========================= */
function commit(){

  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {

    let tickets = DB.get();
    let id = localStorage.getItem("activeTicketId");

    let t = tickets.find(x => x.id == id);
    if(!t) return;

    t.material = materials
      .filter(m => Number(m.qty) > 0)
      .map(m => ({
        nama: m.nama,
        satuan: m.satuan,
        harga: Number(m.harga),
        qty: Number(m.qty)
      }));

    DB.save(tickets);

  }, 300);
}

/* =========================
   RENDER
========================= */
function render(filter=""){

  let body = document.getElementById("matBody");
  body.innerHTML = "";

  materials
    .filter(m => m.nama.toLowerCase().includes(filter.toLowerCase()))
    .forEach((m,i)=>{

      let total = (m.qty||0) * (m.harga||0);

      body.innerHTML += `
        <tr>
          <td>${i+1}</td>
          <td>${m.nama}</td>
          <td>${m.satuan}</td>
          <td>${m.harga.toLocaleString("id-ID")}</td>
          <td>
            <input type="number" value="${m.qty||0}" min="0"
            onchange="setQty('${m.nama}',this.value)">
          </td>
          <td>${total.toLocaleString("id-ID")}</td>
        </tr>
      `;
    });
}

/* =========================
   SET QTY
========================= */
window.setQty = function(nama,val){

  let item = materials.find(x => x.nama === nama);
  if(!item) return;

  item.qty = Number(val);

  commit();
  render(document.getElementById("matSearch").value || "");
};

/* =========================
   SEARCH
========================= */
document.addEventListener("input", function(e){
  if(e.target.id === "matSearch"){
    render(e.target.value);
  }
});

});
