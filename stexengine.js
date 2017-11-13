'use strict';

var path = require('path');
var Bluebird = require('bluebird');
var fs = require('fs');

var statementValueRegExp = new RegExp(/@\w+\('\w+'\)/, 'g');
var endsectionRegExp = new RegExp(/@endsection(\s|$)/)
var allBracketsRegExp = new RegExp(/\('\w+'\)/);
var sectionRegExp = new RegExp(/@section\('\w+'\)(.|\n|\r)*?@endsection(\s|$)/, 'g');

var engine = function engine(config){
    this.render = function render(view){
        return new View(config).rendered(view);
    };
}

var View = function View(config){
    this.config = config;

    this.getPath = function getPath(viewname){
        viewname = viewname.concat('.stex');
        let viewpath = path.resolve(this.config.directory, viewname);
        return viewpath;
    }

    this.rendered = function rendered(viewpath, childsections){
        var view = readFile(this.getPath(viewpath));

        view = this.getIncludes(view);
        
        if(childsections){
            view = replaceYields(view, childsections);
        }else{
            childsections = {};
        }
    
        var sections = Object.assign(childsections, getSections(view, childsections));
        var parentpath = getStatementValue(view, 'extend')

        if(typeof parentpath == 'string'){
            view = new View(this.config).rendered(parentpath, sections);
        }
    
        return view;
    }

    this.getIncludes = function getIncludes(view){
        var config = this.config;
        view = view.replace(statementValueRegExp, function (occurance){
            if(getStatementType(occurance) == 'include'){
                var value = getStatementValue(occurance, 'include');
                return new View(config).rendered(value);
            }else{
                return occurance;
            }
        });
    
        return view;
    }
}

function getSections(view){
    var sections = {};
    
    view.replace(sectionRegExp, function(occurance){
        var sectionname = getStatementValue(occurance, 'section');

        sections[sectionname] = occurance.replace(statementValueRegExp, "")
            .replace(endsectionRegExp, "");
    });
    return sections;
}

function getIncludes(view){
    var includes = [];

    view.replace(statementValueRegExp, function (occurance){
        if(getStatementType(occurance) == 'include'){
            includes.push(getStatementValue(occurance, 'include'));
        }
    });

    return includes;
}

function replaceIncludes(view){
    view = view.replace(statementValueRegExp, function (occurance){
        if(getStatementType(occurance) == 'include'){
            var value = getStatementValue(occurance, 'include');
        }else{
            return occurance;
        }
    });

    return view;
}

function replaceYields(view, childsections){
    view = view.replace(statementValueRegExp, function(occurance){
        if(getStatementType(occurance) == 'yield'){
            var value = getStatementValue(occurance, 'yield');
            return childsections[value];
        }else{
            return occurance;
        }
    });

    return view;
}

function getStatementValue(view, statement){
    var value;
    view.replace(statementValueRegExp, function(occurance){
        if(getStatementType(occurance) == statement){
            value = occurance.replace('@' + statement + '(\'', '')
                .replace('\')', "").trim();
        }
    });

    return value;
}

function getStatementType(match){
    return match.replace('@', "")
        .replace(allBracketsRegExp, "").trim();
}

function readFile(path){
    try{
        return fs.readFileSync(path, 'utf8');
    }catch(e){
        if(e.code = "ENOENT"){
            throw Error('View not found: ' + path); //Implement better stack
        }
        throw e;
    }
}

module.exports = engine;