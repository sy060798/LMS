document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("ticketForm");
const msg  = document.getElementById("msg");

const statusEl = document.getElementById("status");
const typeEl   = document.getElementById("type");

if(!form) return;

/* =========================
   DEFAULT TYPE
========================= */
if(typeEl) typeEl.value = "Activation";

/* =========================
   SUBMIT
========================= */
form.addEventListener("submit", function(e){
    e.preventDefault();

    let data = JSON.parse(localStorage.getItem("tickets") || "[]");

    const spk = document.getElementById("spk")?.value.trim();

    if(!spk){
        alert("SPK wajib diisi!");
        return;
    }

    const spkClean = spk.toLowerCase();

    /* =========================
       CEK DUPLIKAT SPK
    ========================= */
    if(data.some(t => (t.spk || "").toLowerCase() === spkClean)){
        alert("❌ SPK sudah digunakan!");
        return;
    }

    /* =========================
       DATA TICKET FINAL
    ========================= */
    const ticket = {
        id: spk, // SPK = ID utama
        customer: document.getElementById("customer")?.value.trim() || "",
        project: document.getElementById("project")?.value.trim() || "",
        spk: spk,

        type: typeEl?.value || "Activation",

        tanggal: document.getElementById("tanggal")?.value || "",
        city: document.getElementById("city")?.value.trim() || "",

        status: statusEl?.value || "Open",

        ket: document.getElementById("ket")?.value.trim() || "",

        note: "",
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

    if(statusEl) statusEl.value = "Open";
    if(typeEl) typeEl.value = "Activation";
});

});
