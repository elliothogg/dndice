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
  const rollText = log.map(
    ({ name, rolled, die }) => {
      return document.createTextNode(\`\$\{name\} rolled \$\{die\} for \$\{rolled\}.\n\`)
    }
  )
  rollText.forEach(
    (textNode) => {
      textArea.appendChild(textNode)
      textArea.appendChild( document.createElement("br"))
    }
  )
}

const getName = () => document.getElementById("name").value

const roll = (n) => {
  const name = getName()
  const request = new Request('/roll', {
    method: 'POST',
    body: JSON.stringify({ die: n, name }),
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
  const request = new Request('/log', {
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

const clearLog = () => {
  const request = new Request('/log', {
    method: 'DELETE',
  })

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        display([])
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
  <label for="name">Enter your name:</label>
</div>
<div>
  <input id="name" type=text />
  <input type="button" value="Roll D20" onClick='roll("d20")' id='roller' />
  <input type="button" value="Roll D10" onClick='roll("d10")' id='roller' />
  <input type="button" value="Roll D8" onClick='roll("d8")' id='roller' />
  <input type="button" value="Roll D6" onClick='roll("d6")' id='roller' />
  <input type="button" value="Roll D4" onClick='roll("d4")' id='roller' />
  <input type="button" value="Clear Log" onClick='clearLog()' id='roller' />
  <div id="log" />
</div>`)
})

let rollLog = []

app.post('/roll', (req, res) => {
  const { body: { die, name } } = req
  const rolled = roll(die)
  rollLog.push({ name, rolled, die })
  res.send({result: rolled, log: rollLog})
})

app.get('/log', (req, res) => {
  res.send({log: rollLog})
})

app.delete('/log', (req, res) => {
   clearLog();
   res.sendStatus(200);
})

const roll = (n) => {
  [rolls, outOf] = n.split('d')
  return Math.floor(Math.random() * Math.floor(parseInt(outOf))) + 1
}

const clearLog = () => {
  rollLog = [];
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
