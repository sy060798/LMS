const express = require("express");
const cors = require("cors");

const app = express();

/* =========================
   CONFIG
========================= */
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   DATABASE (IN MEMORY)
========================= */
let db = {
  LMS: []
};

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("🚀 LMS SERVER ACTIVE");
});

/* =========================
   GET ALL DATA
========================= */
app.get("/api/get", (req, res) => {
  try {

    let type = req.query.type || "LMS";

    if (!db[type]) db[type] = [];

    res.json(db[type]);

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "GET FAIL" });
  }
});

/* =========================
   SAVE ALL DATA (FULL SYNC)
========================= */
app.post("/api/save", (req, res) => {
  try {

    let { type, data } = req.body;

    if (!type || !Array.isArray(data)) {
      return res.status(400).json({
        error: "Format: { type:'LMS', data:[] }"
      });
    }

    if (!db[type]) db[type] = [];

    /* =========================
       NORMALIZE DATA (ANTI ERROR)
    ========================= */
    db[type] = data.map(item => ({
      id: item.id || item.spk || Date.now(),
      spk: item.spk || "",
      customer: item.customer || "",
      project: item.project || "",
      tanggal: item.tanggal || "",
      city: item.city || "",
      status: item.status || "Open",
      material: Array.isArray(item.material)
        ? item.material.filter(m => Number(m.qty) > 0)
        : [],
      created: item.created || new Date().toISOString()
    }));

    res.json({
      status: "ok",
      total: db[type].length
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "SAVE FAIL" });
  }
});

/* =========================
   DELETE DATA
========================= */
app.post("/api/delete", (req, res) => {
  try {

    let { type, ids } = req.body;

    if (!db[type]) return res.json({ status: "ok" });

    db[type] = db[type].filter(d =>
      !ids.includes(String(d.id || d.spk))
    );

    res.json({
      status: "deleted",
      total: db[type].length
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "DELETE FAIL" });
  }
});

/* =========================
   CLEAR DATA
========================= */
app.post("/api/clear", (req, res) => {
  try {

    let { type } = req.body;

    if (!type) return res.status(400).json({ error: "TYPE REQUIRED" });

    db[type] = [];

    res.json({ status: "cleared" });

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "CLEAR FAIL" });
  }
});

/* =========================
   INFO DASHBOARD
========================= */
app.get("/api/info", (req, res) => {

  let total = db.LMS.length;

  let open = db.LMS.filter(x => x.status === "Open").length;
  let close = db.LMS.filter(x => x.status === "Close").length;

  let materialCount = db.LMS.filter(x =>
    x.material && x.material.length > 0
  ).length;

  res.json({
    total,
    open,
    close,
    materialCount
  });

});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 LMS SERVER RUNNING ON " + PORT);
});
