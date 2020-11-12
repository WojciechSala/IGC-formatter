const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post('/link', (req, res) => {
  const url = req.body.igcUrl;

  fetch(url)
    .then((res) => {
      return res.text();
    })
    .then((body) => formatData(body));

  res.end();
});

function formatData(data) {
  // B,110135,5206343N,00006198W,A,00587,00558
  // 110135: <time> tracklog entry was recorded at 11:01:35 i.e. just after 11am
  // 5206343N: <lat> i.e. 52 degrees 06.343 minutes North
  // 00006198W: <long> i.e. 000 degrees 06.198 minutes West
  // A: <alt valid flag> confirming this record has a valid altitude value
  // 00587: <altitude from pressure sensor>
  // 00558: <altitude from GPS></altitude>

  const lines = data.split(/\r\n|\r|\n/);
  for (let i = 0; i < lines.length; i++) {
    // recognizes first char correctly but splice doesn't remove all
    if (lines[i].slice(0, 1) !== 'B') lines.splice(i, 1);
    // delete lines[i]
  }

  // find first useful element
  const firstB = lines.find((el) => {
    return el.slice(0, 1) === 'B';
  });
  // remove all before first useful element
  lines.splice(0, lines.indexOf(firstB));

  console.log(lines);
}

app.use(express.static('public'));
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
