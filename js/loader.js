/* =========================
   JS LOADER MASTER
========================= */

const scripts = [
  "js/index.js",
  "js/addtiket.js",
  "js/material.js",
  "js/sync.js" // kalau ada
];

scripts.forEach(src => {
  let s = document.createElement("script");
  s.src = src;
  s.defer = true;
  document.head.appendChild(s);
});
