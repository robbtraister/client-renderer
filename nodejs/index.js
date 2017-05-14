'use strict'

var fs = require('fs')
var path = require('path')
var url = require('url')

var express = require('express')
var compression = require('compression')

var renderer
if (process.env.PHANTOMJS === 'server') {
  var httpProxy = require('http-proxy')
  var proxy = httpProxy.createProxyServer({
    target: process.env.RENDERER || 'http://localhost:8081'
  })
  renderer = function (req, res, next) {
    proxy.web(req, res)
  }
} else {
  var childProcess = require('child_process')
  renderer = function (req, res, next) {
    childProcess.exec(`phantomjs "${__dirname}/../phantomjs/render.js" "${req.url}"`, (err, result) => {
      if (err) {
        return next(err)
      }
      res.send(result)
    })
  }
}

var app = express()

app.get('/favicon.ico', (req, res, next) => {
  res.sendStatus(404)
})

app.use((req, res, next) => {
  console.log(req.url)
  next()
})

app.use(compression())

// no extension, or htm, or html
app.get('*', (req, res, next) => {
  if (req.query.rendered === 'true') {
    var urlParts = url.parse(req.url, true, true)
    delete urlParts.query.rendered
    delete urlParts.search
    req.url = url.format(urlParts)

    renderer(req, res, next)
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

var indexFilePath = path.join(__dirname, '..', 'docs', 'index.html')
app.get('*', (req, res, next) => {
  fs.readFile(indexFilePath, function (err, buf) {
    if (err) return next(err)

    res.set('Content-Type', 'text/html')
    res.send(buf)
  })
})

var port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
