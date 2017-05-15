'use strict'

/* global window */

window.components.link = function (component) {
  var link = document.createElement('a')
  link.href = component.content.href
  link.innerText = component.content.text
  return link.outerHTML
}
