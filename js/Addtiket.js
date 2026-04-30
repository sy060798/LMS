document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("ticketForm");
const msg  = document.getElementById("msg");

if(!form) return;

/* =========================
   DEFAULT TYPE
========================= */
const typeEl = document.getElementById("type");
if(typeEl){
    typeEl.value = "Activation";
}

/* =========================
   AUTO NUMBER (NO FIELD)
========================= */
function getNextNo(data){
    if(!Array.isArray(data) || data.length === 0) return 1;

    return Math.max(...data.map(t => Number(t.no || 0))) + 1;
}

/* =========================
   SUBMIT FORM
========================= */
form.addEventListener("submit", function(e){
    e.preventDefault();

    let data = JSON.parse(localStorage.getItem("tickets") || "[]");

    const spk = document.getElementById("spk")?.value.trim();

    if(!spk){
        alert("SPK wajib diisi!");
        return;
    }

    /* =========================
       ANTI DUPLIKAT SPK
    ========================= */
    if(data.find(t => t.spk === spk)){
        alert("❌ SPK sudah digunakan (duplicate)!");
        return;
    }

    /* =========================
       AUTO NO
    ========================= */
    const nextNo = getNextNo(data);

    const ticket = {
        no: nextNo, // 🔥 AUTO NUMBER
        id: spk,
        customer: document.getElementById("customer")?.value.trim() || "",
        project: document.getElementById("project")?.value.trim() || "",
        spk: spk,
        tanggal: document.getElementById("tanggal")?.value || "",
        city: document.getElementById("city")?.value.trim() || "",
        type: document.getElementById("type")?.value || "Activation",
        status: document.getElementById("status")?.value || "Open",
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
    if(statusEl){
        document.getElementById("status").value = "Open";
    }

    if(typeEl){
        typeEl.value = "Activation";
    }

});

});
