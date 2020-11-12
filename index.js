const express = require('express')
const fetch = require('node-fetch');
const app = express()
const port = 3000

app.use(express.urlencoded({
  extended: true
}))

const url = 'https://xcportal.pl/sites/default/files/tracks/2020-06-09/069daro396091568.igc';

app.post('/link', (req, res) => {
	const url = req.body.igcUrl

	fetch(url)
		.then(res => {return res.text()})
		.then(body => console.log(body))

	res.end()
})


app.use(express.static('public'));
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
