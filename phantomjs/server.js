'use strict'

var system = require('system')
var webserver = require('webserver')

var render = require('./render')

var app = webserver.create()

var port = system.env.PORT || 8081
var serving = app.listen(port, function (req, res) {
  render(req.url, function (err, result) {
    if (err) {
      res.statusCode = 500
      res.write(err)
    } else {
      res.statusCode = 200
      res.write(result)
    }
    res.close()
  })
})

if (serving) {
  console.log('Listening on ' + port)
}
