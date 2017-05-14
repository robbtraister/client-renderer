/* global layout */

function render () {
  for (var c = 0; c < layout.components.length; c++) {
    var component = layout.components[c]

    var div = document.createElement('div')
    div.innerHTML = component
    document.body.appendChild(div)
    // document.write('<div>' + component + '</div>')
  }
}

var page = document.location.pathname.replace(/(\/|\.html?)$/, '').replace(/^$/, '/homepage')

var script = document.createElement('script')
script.src = '/pages' + page + '.jsonp'
script.onload = render
document.body.appendChild(script)
