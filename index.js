require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const urlParser = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const orgurl = [];

app.post("/api/shorturl", (req, res, next) => {
  const ur = req.body.url;
  const ind = orgurl.indexOf(ur);

  if (ind >= 0) {
    res.json({
      original_url: ur,
      short_url: ind,
    });
  } else {
    const dnsLook = dns.lookup(
      urlParser.parse(ur).hostname,
      async (err, address) => {
        if (!address) {
          res.json({ error: "invalid url" });
          next();
        } else {
          orgurl.push(ur);
          res.json({
            original_url: ur,
            short_url: orgurl.length - 1,
          });
          next();
        }
      }
    );
  }
});

app.get("/api/shorturl/:num", (req, res) => {
  const num = Number(req.params.num);
  if (isNaN(num) || num < 0 || num >= orgurl.length) {
    res.json({ error: "invalid url" });
  } else {
    res.redirect(orgurl[num]);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
