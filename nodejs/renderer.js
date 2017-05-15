'use strict'

var renderer
if (process.env.PHANTOMJS === 'process') {
  var childProcess = require('child_process')
  renderer = function (req, res, next) {
    childProcess.exec(`phantomjs "${__dirname}/../phantomjs/render.js" "${req.originalUrl}"`, (err, stdout, stderr) => {
      if (err) {
        return next(err)
      }
      if (stderr) {
        console.error(stderr.toString().trim())
      }
      res.send(stdout)
    })
  }
} else {
  var httpProxy = require('http-proxy')
  var proxy = httpProxy.createProxyServer({
    target: process.env.RENDERER || 'http://localhost:8081'
  })
  renderer = function (req, res, next) {
    req.url = req.originalUrl
    proxy.web(req, res)
  }
}

module.exports = renderer
