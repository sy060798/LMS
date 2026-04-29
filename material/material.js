document.addEventListener("DOMContentLoaded", function () {

  console.log("✅ material.js loaded");

  const popup = document.getElementById("materialPopup");
  const body = document.getElementById("matBody");
  const search = document.getElementById("matSearch");

  if (!popup || !body) {
    console.error("❌ Popup element tidak ditemukan");
    return;
  }

  /* =========================
     MASTER DATA
  ========================= */
  const MASTER_MATERIAL = [
    { nama: "Kabel Udara ADSS 12 Core", satuan: "Meter", harga: 10000 },
    { nama: "Kabel Udara ADSS 24 Core", satuan: "Meter", harga: 12000 },
    { nama: "Splitter 1:8", satuan: "Unit", harga: 600000 },
    { nama: "Drop Wire", satuan: "Meter", harga: 5000 },
    { nama: "Lakban", satuan: "Pcs", harga: 10000 }
  ];

  /* =========================
     DB
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
      return { ...m, qty: old ? old.qty : 0 };
    });
  }

  popup.style.display = "flex";
  render("");
};

window.openMaterialById = function(id){
  localStorage.setItem("activeTicketId", id);
  openMaterialPopup();
};
  /* =========================
     CLOSE
  ========================= */
  window.closeMaterialPopup = function () {
    commit();
    popup.style.display = "none";
  };

  /* =========================
     SAVE
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
          harga: m.harga,
          qty: m.qty
        }));

      DB.save(tickets);
      console.log("💾 Material saved");
    }, 300);
  }

  /* =========================
     RENDER
  ========================= */
  function render(filter = "") {
    body.innerHTML = "";

    materials
      .filter(m => m.nama.toLowerCase().includes(filter.toLowerCase()))
      .forEach((m, i) => {

        let total = (m.qty || 0) * m.harga;

        body.innerHTML += `
          <tr>
            <td>${i + 1}</td>
            <td>${m.nama}</td>
            <td>${m.satuan}</td>
            <td>Rp ${m.harga.toLocaleString("id-ID")}</td>
            <td>
              <input type="number" value="${m.qty || 0}" min="0"
                onchange="setQty('${m.nama}', this.value)">
            </td>
            <td>Rp ${total.toLocaleString("id-ID")}</td>
          </tr>
        `;
      });
  }

  /* =========================
     SET QTY
  ========================= */
  window.setQty = function (nama, val) {
    let item = materials.find(x => x.nama === nama);
    if (!item) return;

    item.qty = Number(val);
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
