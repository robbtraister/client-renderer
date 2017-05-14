'use strict'

/* global layout, window */

window.components = window.components || {}

function renderComponentType (components) {
  return function () {
    components.forEach(function (component) {
      component.wrapper.innerHTML = window.components[component.type](component)
    })
  }
}

// load component types
var componentTypes = {}
for (var c = 0; c < layout.components.length; c++) {
  var component = layout.components[c]
  componentTypes[component.type] = componentTypes[component.type] || []
  componentTypes[component.type].push(component)

  var div = document.createElement('div')
  component.wrapper = div
  document.body.appendChild(div)
}

Object.keys(componentTypes).forEach(function (componentType) {
  var script = document.createElement('script')
  script.src = '/components/' + componentType + '.js'
  script.onload = renderComponentType(componentTypes[componentType])
  script.onerror = function () { console.log('error') }
  document.documentElement.appendChild(script)
})
