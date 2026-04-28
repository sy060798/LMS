const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   DATABASE (IN MEMORY)
========================= */
let database = {
  LMS: []
};

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("🚀 LMS Server Aktif");
});

/* =========================
   GET DATA
========================= */
app.get("/api/get", (req, res) => {
  try {

    const type = req.query.type || "LMS";

    if (!database[type]) database[type] = [];

    res.json(database[type]);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "GET ERROR" });
  }
});

/* =========================
   SAVE DATA (SAFE MERGE VERSION)
========================= */
app.post("/api/save", (req, res) => {

  try {

    const { type, data } = req.body;

    if (!type || !Array.isArray(data)) {
      return res.status(400).json({
        error: "Format harus { type:'LMS', data:[] }"
      });
    }

    if (!database[type]) database[type] = [];

    let newData = data.map(item => ({
      ...item,
      spk: item.spk || item.id || String(Date.now())
    }));

    /* =========================
       MERGE BY SPK (ANTI OVERWRITE LOSS)
    ========================= */
    let map = new Map();

    // existing data
    database[type].forEach(d => {
      map.set(d.spk, d);
    });

    // incoming data overwrite
    newData.forEach(d => {
      map.set(d.spk, d);
    });

    database[type] = Array.from(map.values());

    res.json({
      status: "ok",
      total: database[type].length
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "SAVE ERROR" });
  }

});

/* =========================
   DELETE BY SPK
========================= */
app.post("/api/delete", (req, res) => {

  try {

    const { type, spk } = req.body;

    if (!database[type]) return res.json({ status: "ok" });

    database[type] = database[type].filter(d => d.spk !== spk);

    res.json({
      status: "deleted",
      spk
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DELETE ERROR" });
  }

});

/* =========================
   CLEAR ALL
========================= */
app.post("/api/clear", (req, res) => {

  const { type } = req.body;

  if (!type) return res.status(400).json({ error: "type required" });

  database[type] = [];

  res.json({
    status: "cleared"
  });

});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 LMS Server running on port " + PORT);
});
