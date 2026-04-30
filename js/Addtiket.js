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
   SUBMIT → SERVER ONLY
========================= */
form.addEventListener("submit", function(e){
    e.preventDefault();

    const spk = document.getElementById("spk")?.value.trim();

    if(!spk){
        alert("SPK wajib diisi!");
        return;
    }

    const data = window.syncEngine?.DB?.getTickets?.() || [];

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

    /* =========================
       PUSH VIA SYNC ENGINE (SERVER)
    ========================= */
    window.syncEngine.updateTicket(ticket.id, () => ticket);
    window.syncEngine.saveAll();

    /* =========================
       UI FEEDBACK
    ========================= */
    if(msg){
        msg.innerHTML = "✔ Ticket berhasil dikirim ke server";
        msg.style.color = "green";
    }

    form.reset();

    if(statusEl) statusEl.value = "Open";
    if(typeEl) typeEl.value = "Activation";

    /* refresh dashboard */
    window.dispatchEvent(new Event("ticketsUpdated"));
});

});
