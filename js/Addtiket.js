document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("ticketForm");
const msg  = document.getElementById("msg");

/* =========================
   BUAT FIELD TYPE OTOMATIS
========================= */
const statusBox = document.getElementById("status");

if(statusBox){

    const wrap = document.createElement("div");
    wrap.innerHTML = `
        <label style="display:block;margin-bottom:6px;font-size:12px;font-weight:600;">Type</label>
        <select id="type" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;">
            <option value="Activation">Activation</option>
            <option value="TroubleShooting">TroubleShooting</option>
        </select>
    `;

    statusBox.parentNode.after(wrap);
}

if(!form) return;

form.addEventListener("submit", function(e){
    e.preventDefault();

    let data = JSON.parse(localStorage.getItem("tickets") || "[]");

    const spk = document.getElementById("spk")?.value.trim();

    if(!spk){
        alert("SPK wajib diisi!");
        return;
    }

    if(data.find(t => t.spk === spk)){
        alert("SPK sudah digunakan!");
        return;
    }

    const ticket = {
        id: spk,
        customer: document.getElementById("customer")?.value.trim() || "",
        project: document.getElementById("project")?.value.trim() || "",
        spk: spk,
        tanggal: document.getElementById("tanggal")?.value || "",
        city: document.getElementById("city")?.value.trim() || "",
        type: document.getElementById("type")?.value || "Activation",
        status: document.getElementById("status")?.value || "Open",
        ket: document.getElementById("ket")?.value.trim() || "",
        note: document.getElementById("note")?.value.trim() || "",
        material: [],
        created: new Date().toISOString()
    };

    data.push(ticket);

    localStorage.setItem("tickets", JSON.stringify(data));
    localStorage.setItem("activeTicketId", ticket.id);

    if(msg){
        msg.innerHTML = "✔ Ticket berhasil disimpan";
        msg.style.color = "green";
    }

    form.reset();

    const statusEl = document.getElementById("status");
    if(statusEl) statusEl.value = "Open";

    const typeEl = document.getElementById("type");
    if(typeEl) typeEl.value = "Activation";
});

});
