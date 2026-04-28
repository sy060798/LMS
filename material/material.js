document.addEventListener("DOMContentLoaded", function () {

const SERVER_URL = window.SERVER_URL || "";

/* =========================
   POPUP UI
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

/* =========================
   MASTER MATERIAL
========================= */
const MASTER_MATERIAL = [
  // ================= A. MATERIAL =================
  { nama: "Kabel Udara ADSS Span 100 12 Core", satuan: "Meter", harga: 10000 },
  { nama: "Kabel Udara ADSS Span 100 24 Core", satuan: "Meter", harga: 12000 },
  { nama: "Kabel Udara ADSS Span 100 48 Core", satuan: "Meter", harga: 17500 },
  { nama: "Kabel Udara ADSS Span 100 96 Core", satuan: "", harga: 20000 },

  { nama: "Join Closure Dome 12 Core", satuan: "Unit", harga: 750000 },
  { nama: "Join Closure Dome 48 Core + Label ID", satuan: "Set", harga: 1250000 },
  { nama: "Join Closure Dome 96 Core", satuan: "Set", harga: 2500000 },

  { nama: "Inline Closure 12 Core", satuan: "Unit", harga: 1000000 },
  { nama: "Inline Closure 24 Core", satuan: "Unit", harga: 1000000 },
  { nama: "Inline Closure 96 Core", satuan: "Unit", harga: 2500000 },

  { nama: "Outdoor DPFO Kap 16 Core + PLC + Label ID", satuan: "Set", harga: 1000000 },
  { nama: "Outdoor DPFO Kap 24 Core", satuan: "Unit", harga: 1250000 },
  { nama: "Outdoor DPFO Kap 32 Core", satuan: "Unit", harga: 1500000 },

  { nama: "Splitter 1:2", satuan: "Unit", harga: 350000 },
  { nama: "Splitter 1:4", satuan: "Unit", harga: 450000 },
  { nama: "Splitter 1:8", satuan: "Unit", harga: 600000 },
  { nama: "Splitter 1:16", satuan: "Unit", harga: 800000 },

  { nama: "Fixing Slack", satuan: "Set", harga: 250000 },
  { nama: "Flexible Pipe", satuan: "Meter", harga: 2000 },

  { nama: "Tiang 7 Meter", satuan: "Batang", harga: 1550000 },
  { nama: "Tiang 9 Meter", satuan: "Batang", harga: 1750000 },

  { nama: "Aksesoris Tiang (dead end, pole strap, suspension, steel band, ring F)", satuan: "Set", harga: 100000 },

  { nama: "Pipa Subduct 28/32", satuan: "Meter", harga: 7500 },
  { nama: "Pipa PVC 1/2 Inch", satuan: "Batang", harga: 70000 },
  { nama: "Pipa PVC 3/4 Inch", satuan: "Batang", harga: 35000 },
  { nama: "Pipa Subduct HDPE 34/40", satuan: "Meter", harga: 13500 },
  { nama: "Pipa Wavin 3/4", satuan: "Batang", harga: 35000 },

  { nama: "Roset Cap 4 Core", satuan: "Unit", harga: 100000 },
  { nama: "Pipa Conduit 2800 x 20 mm", satuan: "Batang", harga: 20000 },
  { nama: "Klem Pipa Besi", satuan: "Pcs", harga: 4500 },
  { nama: "Drop Wire Furukawa", satuan: "Meter", harga: 5000 },
  { nama: "Fiber Outlet + Pigtail 2 Core", satuan: "Pcs", harga: 50000 },

  { nama: "Pipa Galvaniz 1.5 Inch", satuan: "Batang", harga: 250000 },
  { nama: "Shock Pipa", satuan: "Pcs", harga: 2000 },
  { nama: "Aksesories Subduct", satuan: "Pcs", harga: 8000 },
  { nama: "Duct Protector", satuan: "Meter", harga: 20000 },

  { nama: "Kabel Ties 25 cm", satuan: "Pack", harga: 25000 },
  { nama: "T Way", satuan: "Unit", harga: 7000 },
  { nama: "Tali Rooding", satuan: "Meter", harga: 5000 },
  { nama: "Klem Pipa Conduit/Flexible", satuan: "Unit", harga: 4500 },

  { nama: "Material Klem HDPE", satuan: "Set", harga: 50000 },
  { nama: "Tutup Reducer 4", satuan: "Unit", harga: 50000 },
  { nama: "Reducer Rucika 6x4", satuan: "Unit", harga: 150000 },

  { nama: "Klem Besi Paku Beton", satuan: "Pcs", harga: 10000 },
  { nama: "Stop Link Buckle", satuan: "Pcs", harga: 75000 },
  { nama: "Braket A", satuan: "Pcs", harga: 75000 },
  { nama: "Suspension Clamp", satuan: "Pcs", harga: 75000 },
  { nama: "Strang Clamp", satuan: "Pcs", harga: 75000 },

  { nama: "Kabel Tray U + Cover 50x50x2400", satuan: "Meter", harga: 250000 },
  { nama: "Clamp Kabel Tray", satuan: "Meter", harga: 30000 },
  { nama: "RJ45", satuan: "Pcs", harga: 10000 },
  { nama: "Paku Klem PVC 3/4", satuan: "Pack", harga: 10000 },
  { nama: "Kabel LAN", satuan: "Unit", harga: 5000 },
  { nama: "Lakban", satuan: "Pcs", harga: 10000 },
  { nama: "Elbow Pipa", satuan: "Pcs", harga: 25000 },

  // ================= B. SERVICE =================
  { nama: "Jasa Aktivasi", satuan: "WO", harga: 250000 },
  { nama: "Penarikan FO 2 Core", satuan: "Meter", harga: 3500 },
  { nama: "Penarikan FO 12 Core", satuan: "Meter", harga: 4000 },
  { nama: "Penarikan FO 24 Core", satuan: "Meter", harga: 4500 },
  { nama: "Penarikan FO 48 Core", satuan: "Meter", harga: 4500 },
  { nama: "Penarikan FO 96 Core", satuan: "Meter", harga: 5000 },

  { nama: "Splicing + OTDR", satuan: "Core", harga: 50000 },
  { nama: "Terminasi Pelanggan", satuan: "Lot", harga: 150000 },
  { nama: "Perapihan Galian", satuan: "Lot", harga: 250000 },

  { nama: "Instal DPFO + Splitter", satuan: "Unit", harga: 250000 },
  { nama: "Instal ODP", satuan: "Lot", harga: 350000 },

  { nama: "Boring Crossing Jalan", satuan: "Meter", harga: 75000 },
  { nama: "Rojok + Perapihan", satuan: "Meter", harga: 50000 },
  { nama: "Galian Open Trench", satuan: "LMS", harga: 75000 },
  { nama: "Galian Tanah/Taman", satuan: "Meter", harga: 35000 },

  { nama: "Pemindahan Tiang 7M", satuan: "Batang", harga: 500000 },
  { nama: "Pemindahan Tiang 9M", satuan: "Batang", harga: 550000 },

  { nama: "Instalasi Pipa Subduct", satuan: "Meter", harga: 2000 },
  { nama: "Dismantle Kabel", satuan: "Meter", harga: 4000 },

  { nama: "Survey Route", satuan: "Lot", harga: 250000 },
  { nama: "Dokumentasi & Homepass", satuan: "Lot", harga: 250000 },

  { nama: "Biaya Perizinan", satuan: "Meter", harga: 0 },
  { nama: "Biaya Kompensasi", satuan: "WO", harga: 0 }
];
/* =========================
   LOCAL DB
========================= */
const DB = {
  getTickets: () => JSON.parse(localStorage.getItem("tickets") || "[]"),
  saveTickets: (d) => localStorage.setItem("tickets", JSON.stringify(d)),
};

function getTicket(){
  let id = localStorage.getItem("activeTicketId");
  return DB.getTickets().find(t => t.id == id);
}

/* =========================
   STATE
========================= */
let materials = [];

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
   CLOSE POPUP
========================= */
window.closeMaterialPopup = function(){
  popup.style.display = "none";
};

/* =========================
   COMMIT SAVE (SAFE)
========================= */
let saveTimeout;

function commit(){

  clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {

    let ticket = getTicket();
    if(!ticket) return;

    ticket.material = materials.map(m => ({
      nama: m.nama,
      satuan: m.satuan,
      harga: Number(m.harga),
      qty: Number(m.qty || 0)
    })).filter(m => m.qty > 0);

    let all = DB.getTickets();
    let i = all.findIndex(t => t.id == ticket.id);

    if(i >= 0){
      all[i] = ticket;
      DB.saveTickets(all);
    }

  }, 200);
}

/* =========================
   RENDER
========================= */
function render(filter=""){

  let body = document.getElementById("matBody");
  if(!body) return;

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
          onchange="setQty('${m.nama}',this.value)">
        </td>

        <td>${total.toLocaleString("id-ID")}</td>
      </tr>
    `;
  });
}

/* =========================
   SET QTY (SAFE KEY)
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

/* =========================
   AUTO SAVE CLOSE
========================= */
window.addEventListener("beforeunload", commit);

});
