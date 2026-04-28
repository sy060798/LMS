/* =========================================
   server.js
   FS Ticket DB Sync Server + Loading FIX
========================================= */

if (typeof SERVER_URL === "undefined") {
  var SERVER_URL = "https://tracking-server-production-6a12.up.railway.app";
}

/* ===============================
   LOADING MINI FIX
=============================== */
function showLoading(txt = "Loading...") {

  hideLoading();

  let box = document.createElement("div");
  box.id = "miniLoading";

  box.innerHTML = `
    <div class="loading-box">
      <div class="spin"></div>
      <div class="load-text">${txt}</div>
      <div class="bar-wrap">
        <div class="bar-run"></div>
      </div>
    </div>
  `;

  document.body.appendChild(box);

}

/* =============================== */
function hideLoading() {
  let x = document.getElementById("miniLoading");
  if (x) x.remove();
}

/* ===============================
   CSS AUTO INJECT
=============================== */
(function(){

let style = document.createElement("style");

style.innerHTML = `
#miniLoading{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(255,255,255,.65);
display:flex;
justify-content:center;
align-items:center;
z-index:999999;
backdrop-filter:blur(2px);
}

.loading-box{
width:230px;
background:#ffffff;
padding:20px;
border-radius:14px;
box-shadow:0 10px 25px rgba(0,0,0,.15);
text-align:center;
font-family:Arial,sans-serif;
}

.spin{
width:34px;
height:34px;
margin:auto;
border:4px solid #dfe6e9;
border-top:4px solid #1565c0;
border-radius:50%;
animation:spin360 .8s linear infinite;
}

.load-text{
margin-top:10px;
font-size:14px;
font-weight:bold;
color:#1565c0;
}

.bar-wrap{
margin-top:12px;
height:8px;
background:#e3f2fd;
border-radius:20px;
overflow:hidden;
}

.bar-run{
height:100%;
width:40%;
background:#1565c0;
border-radius:20px;
animation:runbar 1s ease infinite;
}

@keyframes spin360{
from{transform:rotate(0deg)}
to{transform:rotate(360deg)}
}

@keyframes runbar{
0%{margin-left:-40%}
100%{margin-left:100%}
}
`;

document.head.appendChild(style);

})();

/* ===============================
   CEK SERVER
=============================== */
async function cekServer() {
  try{
    const res = await fetch(SERVER_URL + "/");
    const txt = await res.text();
    console.log("SERVER AKTIF:", txt);
  }catch(err){
    console.log("SERVER OFFLINE");
  }
}

/* ===============================
   UPLOAD TICKETS
=============================== */
async function uploadTickets() {

  const tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

  try{

    showLoading("Upload Ticket...");

    await fetch(SERVER_URL + "/saveTickets",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        tickets:tickets
      })
    });

    hideLoading();

  }catch(err){

    hideLoading();
    console.log(err);

  }
}

/* ===============================
   DOWNLOAD TICKETS
=============================== */
async function downloadTickets() {

  try{

    showLoading("Sync Ticket...");

    const res = await fetch(SERVER_URL + "/tickets");
    const data = await res.json();

    if(Array.isArray(data)){
      localStorage.setItem("tickets", JSON.stringify(data));
    }

    hideLoading();

  }catch(err){

    hideLoading();
    console.log(err);

  }
}

/* ===============================
   UPLOAD MATERIAL
=============================== */
async function uploadMaterial() {

  const material = JSON.parse(localStorage.getItem("materialMaster") || "[]");

  try{

    showLoading("Upload Material...");

    await fetch(SERVER_URL + "/saveMaterial",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        material:material
      })
    });

    hideLoading();

  }catch(err){

    hideLoading();
    console.log(err);

  }
}

/* ===============================
   DOWNLOAD MATERIAL
=============================== */
async function downloadMaterial() {

  try{

    showLoading("Sync Material...");

    const res = await fetch(SERVER_URL + "/material");
    const data = await res.json();

    if(Array.isArray(data)){
      localStorage.setItem("materialMaster", JSON.stringify(data));
    }

    hideLoading();

  }catch(err){

    hideLoading();
    console.log(err);

  }
}

/* ===============================
   AUTO START
=============================== */
(async function(){

await cekServer();
await downloadTickets();
await downloadMaterial();

})();

/* ===============================
   AUTO SYNC 1 MENIT
=============================== */
setInterval(function(){

uploadTickets();
uploadMaterial();

},60000);
