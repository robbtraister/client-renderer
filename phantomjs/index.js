'use strict'

var system = require('system')
var webpage = require('webpage')
var webserver = require('webserver')

function getRenderedHTML () {
  function removeTags (tagName) {
    var tags = document.getElementsByTagName(tagName)
    for (var t = tags.length - 1; t >= 0; t--) {
      var tag = tags[t]
      tag.parentElement.removeChild(tag)
    }
  }
  removeTags('noscript')
  removeTags('script')
  return document.documentElement.outerHTML
}

var app = webserver.create()

var port = system.env.PORT || 8081
var src = system.env.SOURCE || 'http://localhost:8080'
var serving = app.listen(port, function (req, res) {
  console.log(req.url)

  var page = webpage.create()
  page.settings.loadImages = false

  page.open(src + req.url, function (status) {
    if (status === 'success') {
      var html = page.evaluate(getRenderedHTML)
      res.statusCode = 200
      res.write('<!DOCTYPE html>' + html)
    } else {
      res.statusCode = 500
    }
    res.close()
    page.close()
  })
})

if (serving) {
  console.log('Listening on ' + port)
}
