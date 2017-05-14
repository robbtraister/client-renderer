'use strict'

/* global module, phantom */

var system = require('system')
var webpage = require('webpage')

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

var src = system.env.SOURCE || 'http://localhost:8080'
function render (url, cb) {
  console.log('url', url)

  var page = webpage.create()
  page.settings.loadImages = false

  page.open(src + url, function (status) {
    if (status === 'success') {
      var html = page.evaluate(getRenderedHTML)
      cb(null, '<!DOCTYPE html>' + html)
    } else {
      cb(1)
    }
    page.close()
  })
}

if (typeof module === 'undefined') {
  render(system.args[1], function (err, result) {
    if (err) {
      phantom.exit(err)
    } else {
      console.log(result)
      phantom.exit(0)
    }
  })
} else {
  module.exports = render
}
