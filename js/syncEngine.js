document.addEventListener("DOMContentLoaded", async function () {

const body = document.getElementById("ticketBody");

/* =========================
   PAKSA AMBIL DATA SERVER
========================= */
async function paksaLoad(){

  try{

    const data = await window.syncEngine.loadAll();

    if(!Array.isArray(data)){
      render([]);
      return;
    }

    render(data);
    summary(data);

  }catch(err){

    console.log(err);
    render([]);

  }
}

/* =========================
   TABLE
========================= */
function render(rows){

  if(!body) return;

  body.innerHTML = rows.map((x,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${x.customer || ""}</td>
      <td>${x.project || ""}</td>
      <td>${x.spk || ""}</td>
      <td>${x.type || ""}</td>
      <td>${x.tanggal || ""}</td>
      <td>${x.city || ""}</td>
      <td>${x.status || ""}</td>
      <td>${x.note || ""}</td>
    </tr>
  `).join("");
}

/* =========================
   SUMMARY
========================= */
function summary(data){

  const tot      = document.getElementById("totTicket");
  const open     = document.getElementById("openTicket");
  const progress = document.getElementById("progressTicket");
  const close    = document.getElementById("closeTicket");
  const pending  = document.getElementById("pendingTicket");

  if(tot) tot.textContent = data.length;
  if(open) open.textContent = data.filter(x=>x.status=="Open").length;
  if(progress) progress.textContent = data.filter(x=>x.status=="Progress").length;
  if(close) close.textContent = data.filter(x=>x.status=="Close").length;
  if(pending) pending.textContent = data.filter(x=>x.status=="Pending").length;
}

/* =========================
   INIT
========================= */
await paksaLoad();

/* refresh paksa */
setInterval(paksaLoad,5000);

});
