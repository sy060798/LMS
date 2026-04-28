document.addEventListener("DOMContentLoaded", function () {

const matBody = document.getElementById("matBody");
const search = document.getElementById("search");

if(!matBody) return;

/* =========================
   MASTER MATERIAL (FIX DATA)
========================= */
const MASTER_MATERIAL = [
  { nama: "Kabel Udara ADSS Span 100 12 Core", satuan: "Meter", harga: 10000 },
  { nama: "Kabel Udara ADSS Span 100 24 Core", satuan: "Meter", harga: 12000 },
  { nama: "Kabel Udara ADSS Span 100 48 Core", satuan: "Meter", harga: 17500 },
  { nama: "Kabel Udara ADSS Span 100 96 Core", satuan: "", harga: 20000 },

  { nama: "Join Closure Dome 12 Core", satuan: "Unit", harga: 750000 },
  { nama: "Join Closure Dome 48 Core + Label ID", satuan: "Set", harga: 1250000 },
  { nama: "Join Closure Dome 96 Core", satuan: "Set", harga: 2500000 },

  { nama: "Inlina Closure 12 Core", satuan: "Unit", harga: 1000000 },
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

  { nama: "Drop Wire Furukawa", satuan: "Meter", harga: 5000 },
  { nama: "Kabel LAN", satuan: "Unit", harga: 5000 },
  { nama: "Lakban", satuan: "Pcs", harga: 10000 },

  { nama: "Jasa Aktivasi", satuan: "WO", harga: 250000 },
  { nama: "Penarikan FO 2 Core", satuan: "Meter", harga: 3500 },
  { nama: "Penarikan FO 12 Core", satuan: "Meter", harga: 4000 },
  { nama: "Penarikan FO 24 Core", satuan: "Meter", harga: 4500 },
  { nama: "Penarikan FO 48 Core", satuan: "Meter", harga: 4500 },
  { nama: "Penarikan FO 96 Core", satuan: "Meter", harga: 5000 },

  { nama: "Splicing + OTDR", satuan: "Core", harga: 50000 },
  { nama: "Terminasi di pelanggan", satuan: "Lot", harga: 150000 },
  { nama: "Perapihan galian", satuan: "Lot", harga: 250000 },

  { nama: "Transportasi", satuan: "WO/Client", harga: 250000 }
];

/* =========================
   LOAD TICKET
========================= */
let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
let activeId = localStorage.getItem("activeTicketId");

let ticket = tickets.find(t => t.id == activeId);

/* =========================
   MATERIAL PER TICKET (CLONE MASTER)
========================= */
let materials = JSON.parse(JSON.stringify(MASTER_MATERIAL));

/* =========================
   LOAD EXISTING QTY IF ANY
========================= */
if(ticket?.material?.length){
  materials = materials.map(m => {
    let old = ticket.material.find(x => x.nama === m.nama);
    return {
      ...m,
      qty: old ? old.qty : 0,
      harga: old ? old.harga : m.harga
    };
  });
}

/* =========================
   COMMIT (SAVE KE TICKET)
========================= */
function commit(){

  if(!ticket) return;

  ticket.material = materials
    .filter(m => Number(m.qty) > 0)
    .map(m => ({
      nama: m.nama,
      satuan: m.satuan,
      harga: Number(m.harga),
      qty: Number(m.qty || 0)
    }));

  localStorage.setItem("tickets", JSON.stringify(tickets));
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
      !filter ||
      (x.nama || "").toLowerCase().includes(filter.toLowerCase())
    );

  list.forEach((item,i)=>{

    let total = Number(item.harga) * Number(item.qty || 0);

    matBody.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${item.nama}</td>
        <td>${item.satuan}</td>

        <td>
          <input type="number"
            value="${item.harga}"
            style="width:100px;padding:5px"
            onchange="ubahHarga(${item._i},this.value)">
        </td>

        <td>
          <input type="number"
            value="${item.qty || 0}"
            min="0"
            style="width:70px;padding:5px"
            onchange="ubahQty(${item._i},this.value)">
        </td>

        <td>${rp(total)}</td>

        <td style="color:#999">LOCK</td>
      </tr>
    `;
  });

}

/* =========================
   QTY UPDATE
========================= */
window.ubahQty = function(i,val){
  if(!materials[i]) return;

  materials[i].qty = Number(val);
  commit();
  render(search?.value || "");
};

/* =========================
   HARGA UPDATE
========================= */
window.ubahHarga = function(i,val){
  if(!materials[i]) return;

  materials[i].harga = Number(val);
  commit();
  render(search?.value || "");
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
   AUTO SAVE
========================= */
window.addEventListener("beforeunload", function(){
  commit();
});

/* =========================
   INIT
========================= */
render("");

});
