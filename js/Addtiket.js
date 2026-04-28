document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("ticketForm");
const msg  = document.getElementById("msg");

if(!form) return;

form.addEventListener("submit", function(e){
    e.preventDefault();

    let data = JSON.parse(localStorage.getItem("tickets")) || [];

    const ticket = {
        no       : document.getElementById("no").value,
        customer : document.getElementById("customer").value.trim(),
        project  : document.getElementById("project").value.trim(),
        spk      : document.getElementById("spk").value.trim(),
        tanggal  : document.getElementById("tanggal").value,
        city     : document.getElementById("city").value.trim(),
        status   : document.getElementById("status").value,
        ket      : document.getElementById("ket").value.trim(),
        created  : new Date().toISOString()
    };

    data.push(ticket);

    localStorage.setItem("tickets", JSON.stringify(data));

    msg.innerHTML = "Ticket berhasil disimpan.";
    msg.style.color = "green";

    form.reset();

    document.getElementById("status").value = "Open";
});

});
