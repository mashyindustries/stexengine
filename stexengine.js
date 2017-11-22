'use strict';

var View = require('./view')

module.exports = function Engine(config){
    this.render = function render(view){
        return new View(config).render(view)
    }

    return this
}