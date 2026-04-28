/* =========================================
   server.js
   FS Ticket DB Sync Server + Loading
========================================= */

if (typeof SERVER_URL === "undefined") {
  var SERVER_URL = "https://tracking-server-production-6a12.up.railway.app";
}

/* ===============================
   LOADING MINI
=============================== */
function showLoading(txt = "Loading...") {

  let old = document.getElementById("miniLoading");
  if (old) old.remove();

  let div = document.createElement("div");
  div.id = "miniLoading";

  div.innerHTML = `
  <div class="spin"></div>
  <div style="margin-top:8px;font-size:13px">${txt}</div>
  `;

  div.style.position = "fixed";
  div.style.top = "50%";
  div.style.left = "50%";
  div.style.transform = "translate(-50%,-50%)";
  div.style.background = "#fff";
  div.style.padding = "18px 22px";
  div.style.borderRadius = "12px";
  div.style.boxShadow = "0 5px 20px rgba(0,0,0,.2)";
  div.style.zIndex = "99999";
  div.style.textAlign = "center";
  div.style.fontFamily = "Arial";

  document.body.appendChild(div);

  let style = document.createElement("style");
  style.innerHTML = `
  .spin{
    width:28px;
    height:28px;
    border:4px solid #ddd;
    border-top:4px solid #1565c0;
    border-radius:50%;
    margin:auto;
    animation:putar 1s linear infinite;
  }

  @keyframes putar{
    from{transform:rotate(0deg)}
    to{transform:rotate(360deg)}
  }
  `;
  document.head.appendChild(style);

}

function hideLoading() {
  let x = document.getElementById("miniLoading");
  if (x) x.remove();
}

/* ===============================
   CEK SERVER
=============================== */
async function cekServer() {

  try {

    const res = await fetch(SERVER_URL + "/");
    const txt = await res.text();

    console.log("SERVER AKTIF :", txt);

  } catch (err) {

    console.error("SERVER OFFLINE :", err);

  }

}

/* ===============================
   UPLOAD TICKETS
=============================== */
async function uploadTickets() {

  const tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

  try {

    showLoading("Upload Ticket...");

    const res = await fetch(SERVER_URL + "/saveTickets", {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        tickets:tickets
      })
    });

    await res.json();

    hideLoading();

  } catch (err) {

    hideLoading();
    console.error(err);

  }

}

/* ===============================
   DOWNLOAD TICKETS
=============================== */
async function downloadTickets() {

  try {

    showLoading("Sync Ticket...");

    const res = await fetch(SERVER_URL + "/tickets");

    const data = await res.json();

    if (Array.isArray(data)) {
      localStorage.setItem("tickets", JSON.stringify(data));
    }

    hideLoading();

  } catch (err) {

    hideLoading();
    console.error(err);

  }

}

/* ===============================
   UPLOAD MATERIAL
=============================== */
async function uploadMaterial() {

  const data = JSON.parse(localStorage.getItem("materialMaster") || "[]");

  try {

    showLoading("Upload Material...");

    const res = await fetch(SERVER_URL + "/saveMaterial", {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        material:data
      })
    });

    await res.json();

    hideLoading();

  } catch(err){

    hideLoading();
    console.error(err);

  }

}

/* ===============================
   DOWNLOAD MATERIAL
=============================== */
async function downloadMaterial() {

  try {

    showLoading("Sync Material...");

    const res = await fetch(SERVER_URL + "/material");

    const data = await res.json();

    if(Array.isArray(data)){
      localStorage.setItem("materialMaster", JSON.stringify(data));
    }

    hideLoading();

  } catch(err){

    hideLoading();
    console.error(err);

  }

}

/* ===============================
   AUTO START
=============================== */

cekServer();
downloadTickets();
downloadMaterial();

/* ===============================
   AUTO SYNC
=============================== */

setInterval(function(){

  uploadTickets();
  uploadMaterial();

},60000);
