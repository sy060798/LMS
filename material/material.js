document.addEventListener("DOMContentLoaded", function () {

  console.log("✅ material.js loaded");

  const popup = document.getElementById("materialPopup");
  const body = document.getElementById("matBody");
  const search = document.getElementById("matSearch");

  if (!popup || !body || !search) {
    console.error("❌ Element popup tidak ditemukan");
    return;
  }

  /* =========================
     MASTER DATA
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
     DB LOCALSTORAGE
  ========================= */
  const DB = {
    get: () => JSON.parse(localStorage.getItem("tickets") || "[]"),
    save: (d) => localStorage.setItem("tickets", JSON.stringify(d))
  };

  function getTicket() {
    let id = localStorage.getItem("activeTicketId");
    return DB.get().find(t => t.id == id);
  }

  let materials = [];
  let saveTimer;

  /* =========================
     OPEN POPUP
  ========================= */
  window.openMaterialPopup = function () {

    const ticket = getTicket();

    if (!ticket) {
      alert("❌ Ticket belum dipilih");
      return;
    }

    materials = JSON.parse(JSON.stringify(MASTER_MATERIAL));

    if (ticket.material) {
      materials = materials.map(m => {
        let old = ticket.material.find(x => x.nama === m.nama);
        return {
          ...m,
          qty: old ? old.qty : 0,
          harga: old ? old.harga : m.harga
        };
      });
    }

    popup.style.display = "flex";
    render("");
  };

  /* =========================
     OPEN BY ID
  ========================= */
  window.openMaterialById = function (id) {
    localStorage.setItem("activeTicketId", id);
    window.openMaterialPopup();
  };

  /* =========================
     CLOSE POPUP
  ========================= */
  window.closeMaterialPopup = function () {
    commit();
    popup.style.display = "none";
  };

  /* =========================
     AUTO SAVE
  ========================= */
  function commit() {

    clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {

      let tickets = DB.get();
      let id = localStorage.getItem("activeTicketId");

      let t = tickets.find(x => x.id == id);
      if (!t) return;

      t.material = materials
        .filter(m => m.qty > 0)
        .map(m => ({
          nama: m.nama,
          satuan: m.satuan,
          harga: Number(m.harga),
          qty: Number(m.qty)
        }));

      DB.save(tickets);

      console.log("💾 Material saved");

    }, 200);
  }

  /* =========================
     RENDER TABLE
  ========================= */
  function render(filter = "") {

    body.innerHTML = "";

    materials
      .filter(m => m.nama.toLowerCase().includes(filter.toLowerCase()))
      .forEach((m, i) => {

        let total = (m.qty || 0) * (m.harga || 0);

        body.innerHTML += `
          <tr>
            <td>${i + 1}</td>
            <td>${m.nama}</td>
            <td>${m.satuan}</td>

            <!-- 🔥 HARGA BISA DI EDIT -->
            <td>
              <input type="number" min="0" value="${m.harga}"
                onchange="setHarga('${m.nama}', this.value)"
                style="width:100px">
            </td>

            <!-- 🔥 QTY BISA DI EDIT -->
            <td>
              <input type="number" min="0" value="${m.qty || 0}"
                onchange="setQty('${m.nama}', this.value)">
            </td>

            <td>Rp ${total.toLocaleString("id-ID")}</td>
          </tr>
        `;
      });
  }

  /* =========================
     UPDATE QTY
  ========================= */
  window.setQty = function (nama, val) {

    let item = materials.find(x => x.nama === nama);
    if (!item) return;

    item.qty = Number(val);

    commit();
    render(search.value || "");
  };

  /* =========================
     🔥 UPDATE HARGA (BARU)
  ========================= */
  window.setHarga = function (nama, val) {

    let item = materials.find(x => x.nama === nama);
    if (!item) return;

    item.harga = Number(val);

    commit();
    render(search.value || "");
  };

  /* =========================
     SEARCH
  ========================= */
  search.addEventListener("input", function () {
    render(this.value);
  });

});
