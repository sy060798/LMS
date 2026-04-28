if (typeof SERVER_URL === "undefined") {
  var SERVER_URL = "https://tracking-server-production-6a12.up.railway.app";
}

/* ===============================
   AUTH
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

function hideLoading(){
let x = document.getElementById("miniLoading");
if(x) x.remove();
}

/* ===============================
   CSS LOADING
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
animation:spin .8s linear infinite;
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
let res = await fetch(SERVER_URL + "/");
console.log("SERVER OK");
}catch(e){
console.log("SERVER OFFLINE");
}
}

/* ===============================
   TICKETS SYNC (FULL MASTER)
=============================== */
async function uploadTickets(){

let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

try{

showLoading("Upload Tickets");

await fetch(SERVER_URL+"/saveTickets",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
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

showLoading("Download Tickets");

let res = await fetch(SERVER_URL+"/tickets");
let data = await res.json();

if(Array.isArray(data)){
localStorage.setItem("tickets", JSON.stringify(data));
}

hideLoading();

}catch(e){
hideLoading();
console.log(e);
}

}

/* ===============================
   ACTIVE TICKET
=============================== */
function getActiveTicketId(){
return localStorage.getItem("activeTicketId");
}

/* ===============================
   SAVE MATERIAL PER TICKET
=============================== */
function saveMaterialToTicket(materials){

let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

let id = getActiveTicketId();

if(!id) return;

let t = tickets.find(x => x.id == id);

if(!t) return;

t.material = materials;

localStorage.setItem("tickets", JSON.stringify(tickets));
}

/* ===============================
   UPLOAD MATERIAL PER TICKET (LOGIN SAFE)
=============================== */
async function uploadMaterial(){

const auth = getAuth();

if(!auth || !auth.token){
console.log("Belum login");
return;
}

let tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
let id = getActiveTicketId();

let ticket = tickets.find(t => t.id == id);

if(!ticket){
console.log("Ticket tidak ada");
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
   DOWNLOAD MATERIAL
=============================== */
async function downloadMaterial(){

try{

showLoading("Download Material");

let res = await fetch(SERVER_URL+"/material");
let data = await res.json();

/* OPTIONAL SERVER FORMAT */
if(Array.isArray(data)){
localStorage.setItem("materialMaster", JSON.stringify(data));
}

hideLoading();

}catch(e){
hideLoading();
console.log(e);
}

}

/* ===============================
   AUTO START SYNC
=============================== */
(async function(){
await cekServer();
await downloadTickets();
await downloadMaterial();
})();

/* ===============================
   AUTO SYNC REALTIME
=============================== */
setInterval(function(){

uploadTickets();
uploadMaterial();

},30000); // 30 detik lebih aman
