document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("ticketForm");
const msg  = document.getElementById("msg");

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
        id: spk, // 🔥 pakai SPK sebagai ID
        no: document.getElementById("no")?.value || "",
        customer: document.getElementById("customer")?.value.trim() || "",
        project: document.getElementById("project")?.value.trim() || "",
        spk: spk,
        tanggal: document.getElementById("tanggal")?.value || "",
        city: document.getElementById("city")?.value.trim() || "",
        status: document.getElementById("status")?.value || "Open",
        ket: document.getElementById("ket")?.value.trim() || "",
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
});

});
