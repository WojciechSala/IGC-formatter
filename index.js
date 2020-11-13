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

  // find last useful element
  let lastB = lines.pop();
  while (lastB.slice(0, 1) !== 'B') {
    lastB = lines.pop();
    if (lines.slice(0, 1) === 'B') return lastB;
  }

  timeFormat(firstB.slice(1, 7), lastB.slice(1, 7));
  // timeFormat(112212, 122311);
}

// time func : start, stop, duration
function timeFormat(start, stop) {
  // count duration of the flight
  let duration = stop - start;
  duration.length % 2 === 0 ? null : (duration = '0' + duration);

  // divide into array
  startTime = start.toString().match(/.{1,2}/g);
  stopTime = stop.toString().match(/.{1,2}/g);
  duration = duration.toString().match(/.{1,2}/g);

  // convert to time format
  startTime = startTime[0] + ':' + startTime[1] + ':' + startTime[2];
  stopTime = stopTime[0] + ':' + stopTime[1] + ':' + stopTime[2];

  // duration can take few minutes or hours
  if (duration.length <= 2) duration = '00:' + duration[0] + ':' + duration[1];
  else duration = duration[0] + ':' + duration[1] + ':' + duration[2];

  console.log(startTime, stopTime, duration);
}

// altitude func : start, stop
// lat, long func : distance (2D), google maps integration

app.use(express.static('public'));
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
