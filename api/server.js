const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const app = express();
const PORT = 3022;

app.use(cors());

app.get("/", (req, res) => {
  res.json([
    {
      id: crypto.randomUUID(),
      name: "Marcio",
      phone: "18988079245",
    },
    {
      id: crypto.randomUUID(),
      name: "Marcio Tezini",
      phone: "18988079246",
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
