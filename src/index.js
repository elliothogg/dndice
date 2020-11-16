const express = require('express')
const app = express()
const port = 3000

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
  res.send(`
<script type="text/javascript" >
const display = (log) => {
  const textArea = document.getElementById("log")
  textArea.innerHTML = ""
  const rollText = log.map(({ name, rolled, die }) => document.createTextNode(\`\$\{name\} rolled \$\{die\} for \$\{rolled\}.\n\`))
  rollText.forEach((textNode) => {
    textArea.appendChild(textNode)
    textArea.appendChild( document.createElement("br"))
  })
}

const getName = () => document.getElementById("name").value

const roll = () => {
  const name = getName()
  const request = new Request('/roll', {
    method: 'POST',
    body: JSON.stringify({ die: 'd20', name }),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('Something went wrong on api server!')
      }
    })
    .then(({ log }) => {
      display(log)
    }).catch(error => {
      console.log(error)
    })
}

const poll = () => {
  const request = new Request('/poll', {
    method: 'GET',
  })

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('Something went wrong on api server!')
      }
    })
    .then(({ log }) => {
      display(log)
    }).catch(error => {
      console.log(error)
    })
}

poll()
setInterval(poll, 1000)

</script>
<div>
   <input id="name" type=text placeholder="enter your name.."/>
   <input type="button" value="Click me" onClick='roll()' id='roller' />
   <div id="log" />
</div>`)
})

const rollLog = []

app.post('/roll', (req, res) => {
  const { body: { die, name } } = req
  const rolled = roll(die)
  rollLog.push({ name, rolled, die })
  res.send({result: rolled, log: rollLog})
})

app.get('/poll', (req, res) => {
  res.send({log: rollLog})
})

const roll = (n) => {
  [rolls, outOf] = n.split('d')
  console.log(rolls)
  return Math.floor(Math.random() * Math.floor(parseInt(outOf))) + 1
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
