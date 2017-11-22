'use strict'

var StexEngine = require('../index')
var path = require('path')

var engine = new StexEngine({basedir: path.resolve(__dirname, 'views')})

var page = engine.render('pages.home')

console.log(page)