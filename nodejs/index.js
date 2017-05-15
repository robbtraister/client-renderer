'use strict'

var fs = require('fs')
var path = require('path')
var url = require('url')

var express = require('express')
var compression = require('compression')
var cookieParser = require('cookie-parser')

var renderer = require('./renderer')

var RENDER_QUERY_TOKEN = 'rendered'
var RENDER_COOKIE_TOKEN = RENDER_QUERY_TOKEN

var app = express()

app.get('/favicon.ico', (req, res, next) => {
  res.sendStatus(404)
})

app.use((req, res, next) => {
  console.log(req.url)
  next()
})

app.use(compression())

app.get('*',
  (req, res, next) => {
    if (req.query && req.query.hasOwnProperty(RENDER_QUERY_TOKEN)) {
      // remove 'rendered' query parameter
      var urlParts = url.parse(req.originalUrl, true, true)
      delete urlParts.query.rendered
      delete urlParts.search
      req.render = true
      req.originalUrl = url.format(urlParts)
    }
    next()
  }
)

if (process.env.COOKIE_REDIRECT === 'true') {
  app.get('*',
    (req, res, next) => {
      if (req.render) {
        // set rendered cookie value and refresh
        res.cookie(RENDER_COOKIE_TOKEN, '')
        return res.redirect(req.originalUrl)
      } else {
        next()
      }
    },
    cookieParser({ extended: false }),
    (req, res, next) => {
      if (req.cookies && req.cookies.hasOwnProperty && req.cookies.hasOwnProperty(RENDER_COOKIE_TOKEN)) {
        // remove rendered cookie
        res.clearCookie(RENDER_COOKIE_TOKEN)
        // render server-side
        return renderer(req, res, next)
      } else {
        next()
      }
    }
  )
} else {
  app.get('*',
    (req, res, next) => {
      if (req.render) {
        // render server-side
        return renderer(req, res, next)
      } else {
        next()
      }
    }
  )
}

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
