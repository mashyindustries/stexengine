'use strict'

var path = require('path')
var fs = require('fs')

var statementValueRegExp = new RegExp(/@\w+\('\w+'\)/, 'g');
var endsectionRegExp = new RegExp(/@endsection(\s|$)/)
var allBracketsRegExp = new RegExp(/\('\w+'\)/);
var sectionRegExp = new RegExp(/@section\('\w+'\)(.|\n|\r)*?@endsection(\s|$)/, 'g');

module.exports = function View(config){
    
    function getPath(viewname){
        return path.resolve(config.basedir, viewname.split('.').join(path.sep) + '.stex')
    }

    this.render = function render(viewpath, childSections, parentpath){
        var view = readFile(getPath(viewpath), viewpath, parentpath);

        if(!childSections){
            childSections = {};
        }
        view = replaceStatements('url', view, function(occurance, values){
            return values[0]
        })
        
        view = replaceStatements('includes', view, function(occurance, values){
            return new View(config).render(values[0], {}, viewpath)
        })

        view = replaceStatements('yield', view, function(occurance, values){
            var replace = childSections[values[0]]
            return replace ? replace : ''
        })
        
        var sections = Object.assign(getStatements('section', view), childSections)

        var parentpath = getStatementValues('extends', view)[0]

        if(parentpath){
            var parentpath = parentpath[0]
            view = new View(config).render(parentpath, sections, viewpath);
        }
    
        return view;
    }
}

/**
 * 
 * @param {String} statementname The statement block name to replace
 * @param {String} view The view string
 * @param {Function} callback The string.replace function as a callback, with the variables (occurance, values)
 * 
 * @returns {String} updated view
 */
function replaceStatements(statementname, view, callback){
    var values = getStatementValues(statementname, view)
    var count = 0
    return view.replace(getStatementRegExp(statementname), function(occurance){
        return callback(occurance, values[count++])
    })
}

/**
 * 
 * @param {String} statementname The statement block name to replace
 * @param {String} view The view string
 * 
 * @returns {Object}
 */
function getStatements(statementname, view){
    var statements = {}
    var statementsPairArray = getStatementValues(statementname, view)
    var count = 0
    for(var pair in statementsPairArray){
        let pairval = statementsPairArray[pair[0]]
        statements[pairval[0]] = pairval[1]
    }

    return statements
}

/**
 * Gets the first occurance of a statement value
 * 
 * @param {String} statementname The statement block name to replace
 * @param {String} view The view string
 * 
 * @returns {Array} eg: [['foo', 'bar]['baz', 'bar']]
 */
function getStatementValues(statementname, view){
    var values = []
    view.replace(getStatementRegExp(statementname), function(occurance){
        var arr = []
        var functionvars;

        occurance.replace(getStatementFunctionRegExp(statementname), function(occurance){
            functionvars = occurance.trim()
                .replace('@' + statementname + '(', '')
                .replace(')', '')
                .split(',')
        })

        for(var value in functionvars){
            arr.push(functionvars[value]
                .trim()
                .replace(/(^'|'$)/gm, ''))
        }
        
        if(arr.length === 1){
            let val = occurance
                .replace(getStatementRegExp(statementname), function(occurance){
                    return occurance
                        .replace(getStatementFunctionRegExp(statementname), "")
                        .replace(getStatementEndRegExp(statementname), "")
            })
            if(val) arr.push(val)
        }
        values.push(arr)
        return
    })
    return values
}

function getStatementRegExp(statementname){
    return RegExp(
        "@" + statementname + "\\(([^,)\\n]+\\)(.|\\n|\\r)*?@end" + statementname + "($|\\s)|([^,)\\n]|[^,)\\n],[^,)\\n])+\\))"
    , 'gm')
}

function getStatementFunctionRegExp(statementname){
    return RegExp(
        "@" + statementname + "\\([^)\\n]+\\)"
    , 'gm')
}

function getStatementEndRegExp(statementname){
    return RegExp("@end" + statementname + "(\\s|$)", 'gm')
}

function readFile(path, val, parent){
    try{
        return fs.readFileSync(path, 'utf8');
    }catch(e){
        if(e.code = "ENOENT"){
            var inparent = parent ? "in view: \"" + parent + "\" " : ""
            var errormessage = "View: \"" + val + "\" " + inparent + "not found"
            e = Error(errormessage)
            e.code = "VIEW_NOT_FOUND"
        }
        throw e;
    }
}
