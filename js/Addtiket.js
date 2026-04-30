document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("ticketForm");
const msg  = document.getElementById("msg");

const statusEl = document.getElementById("status");
const typeEl = document.getElementById("type");

if(!form) return;

/* =========================
   DEFAULT VALUE
========================= */
if(typeEl) typeEl.value = "Activation";

/* =========================
   AUTO NUMBER
========================= */
function getNextNo(data){
    if(!Array.isArray(data) || data.length === 0) return 1;

    return data.reduce((max, t) => {
        const num = Number(t.no || 0);
        return num > max ? num : max;
    }, 0) + 1;
}

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
       ANTI DUPLIKAT SPK
    ========================= */
    if(data.some(t => (t.spk || "").toLowerCase() === spkClean)){
        alert("❌ SPK sudah digunakan (duplicate)!");
        return;
    }

    /* =========================
       AUTO NO
    ========================= */
    const nextNo = getNextNo(data);

    const ticket = {
        no: nextNo,
        id: spk,
        customer: document.getElementById("customer")?.value.trim() || "",
        project: document.getElementById("project")?.value.trim() || "",
        spk: spk,
        tanggal: document.getElementById("tanggal")?.value || "",
        city: document.getElementById("city")?.value.trim() || "",
        type: typeEl?.value || "Activation",
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

    /* =========================
       RESET DEFAULT VALUE
    ========================= */
    if(statusEl) statusEl.value = "Open";
    if(typeEl) typeEl.value = "Activation";
});

});
