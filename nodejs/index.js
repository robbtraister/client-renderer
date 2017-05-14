'use strict'

var fs = require('fs')
var path = require('path')
var url = require('url')

var express = require('express')
var compression = require('compression')
var httpProxy = require('http-proxy')

var app = express()

app.get('/favicon.ico', (req, res, next) => {
  res.sendStatus(404)
})

app.use((req, res, next) => {
  console.log(req.url)
  next()
})

app.use(compression())

var proxy = httpProxy.createProxyServer({
  target: process.env.RENDERER || 'http://localhost:8081'
})
// no extension, or htm, or html
app.get('*', (req, res, next) => {
  if (req.query.rendered === 'true') {
    var urlParts = url.parse(req.url, true, true)
    delete urlParts.query.rendered
    delete urlParts.search
    req.url = url.format(urlParts)
    proxy.web(req, res)
  } else {
    next()
  }
})

app.get(/\/[^/.]*$/, (req, res, next) => {
  var urlParts = url.parse(req.url, true, true)
  urlParts.pathname = `${urlParts.pathname.replace(/\/*$/, '')}/index.html`
  req.url = url.format(urlParts)
  next()
})

app.get('*', express.static(path.join(__dirname, '..', 'docs')))

var indexFile = path.join(__dirname, '..', 'docs', 'index.html')
app.get('*', (req, res, next) => {
  fs.readFile(indexFile, function (err, buf) {
    if (err) return next(err)

    res.set('Content-Type', 'text/html')
    res.send(buf)
  })
})

var port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
