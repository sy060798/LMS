// =========================================
// server.js
// FS Ticket DB Sync Server + Loading FIX
// + PER TICKET MATERIAL SAVE
// =========================================

if (typeof SERVER_URL === "undefined") {
  var SERVER_URL = "https://tracking-server-production-6a12.up.railway.app";
}

/* ===============================
   AUTH (LOGIN SIMPLE)
=============================== */
function getAuth(){
return JSON.parse(localStorage.getItem("auth") || "null");
}

/* ===============================
   LOADING
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

function hideLoading() {
  let x = document.getElementById("miniLoading");
  if (x) x.remove();
}

/* ===============================
   CSS AUTO
=============================== */
(function(){

let style = document.createElement("style");

style.innerHTML = `
#miniLoading{
position:fixed;
top:0;left:0;
width:100%;height:100%;
background:rgba(255,255,255,.65);
display:flex;
justify-content:center;
align-items:center;
z-index:999999;
backdrop-filter:blur(2px);
}

.loading-box{
width:230px;
background:#fff;
padding:20px;
border-radius:14px;
box-shadow:0 10px 25px rgba(0,0,0,.15);
text-align:center;
font-family:Arial;
}

.spin{
width:34px;height:34px;
margin:auto;
border:4px solid #ddd;
border-top:4px solid #1565c0;
border-radius:50%;
animation:spin 0.8s linear infinite;
}

.load-text{
margin-top:10px;
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
animation:run 1s infinite;
}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes run{0%{margin-left:-40%}100%{margin-left:100%}}
`;

document.head.appendChild(style);

})();

/* ===============================
   SERVER CHECK
=============================== */
async function cekServer(){
try{
const res = await fetch(SERVER_URL+"/");
const txt = await res.text();
console.log("SERVER OK:",txt);
}catch(e){
console.log("SERVER OFFLINE");
}
}

/* ===============================
   TICKETS SYNC
=============================== */
async function uploadTickets(){
let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

try{
showLoading("Upload Ticket");

await fetch(SERVER_URL+"/saveTickets",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({tickets})
});

hideLoading();

}catch(e){
hideLoading();
console.log(e);
}
}

async function downloadTickets(){
try{
showLoading("Sync Ticket");

let res = await fetch(SERVER_URL+"/tickets");
let data = await res.json();

if(Array.isArray(data)){
localStorage.setItem("tickets",JSON.stringify(data));
}

hideLoading();

}catch(e){
hideLoading();
console.log(e);
}
}

/* ===============================
   MATERIAL PER TICKET SYSTEM
=============================== */

// AMBIL ACTIVE TICKET
function getActiveTicketId(){
return localStorage.getItem("activeTicketId");
}

/* ===============================
   SAVE MATERIAL KE TICKET AKTIF
=============================== */
function saveMaterialToTicket(materials){

let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

let id = getActiveTicketId();

if(!id){
console.log("Tidak ada ticket aktif");
return;
}

let idx = tickets.findIndex(t => t.id == id);

if(idx === -1){
console.log("Ticket tidak ditemukan");
return;
}

// SIMPAN MATERIAL KE TICKET TERSEBUT
tickets[idx].material = materials;

localStorage.setItem("tickets", JSON.stringify(tickets));
}

/* ===============================
   UPLOAD MATERIAL (LOGIN + PER TICKET)
=============================== */
async function uploadMaterial(){

const auth = getAuth();

if(!auth || !auth.token){
alert("Anda belum login!");
return;
}

let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
let id = getActiveTicketId();

let ticket = tickets.find(t => t.id == id);

if(!ticket){
alert("Ticket tidak aktif!");
return;
}

try{

showLoading("Upload Material");

await fetch(SERVER_URL+"/saveMaterial",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+auth.token
},
body:JSON.stringify({
ticketId:id,
material:ticket.material || []
})
});

hideLoading();

}catch(e){
hideLoading();
console.log(e);
}

}

/* ===============================
   DOWNLOAD MATERIAL (PER TICKET)
=============================== */
async function downloadMaterial(){

try{

showLoading("Sync Material");

let res = await fetch(SERVER_URL+"/material");
let data = await res.json();

// OPTIONAL: kalau server return per ticket
if(Array.isArray(data)){
localStorage.setItem("materialMaster",JSON.stringify(data));
}

hideLoading();

}catch(e){
hideLoading();
console.log(e);
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
   AUTO SYNC
=============================== */
setInterval(function(){
uploadTickets();
uploadMaterial();
},60000);
