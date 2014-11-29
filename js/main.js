/**
 * Created by: Alfred Feldmeyer
 */

/**
 * Findet ein JS-Element nach Attributen... In case there is no Jquery...
 * @param attr
 * @param context
 * @returns {Array}
 */
function getElementsByAttribute(attr, context) {
    var nodeList = (context || document).getElementsByTagName('*');
    var nodeArray = [];

    for (var i = 0, node; node = nodeList[i]; i++) {
        if ( node.getAttribute(attr) ) nodeArray.push(node);
    }
    return nodeArray;
}


/** Require.js-Config. Before loading, the current DOM will be scanned for
 * elements with ng-app-attributes to Include them
 * e.g. <div ng-app="bubblebathtub"> will looking for a module-file in
 * /js/modules/bubblebathtub/module.js
 */
//globale Abhändigkeiten
var globalDeps=['jquery','angular','angular-resource','angular-animate', 'd3'];
//modulare Abhängigkeiten e.g. linegraph/module
var modulDeps=[];
//Name der Module die zu Lade sind (für angular-register)
var modulNames=[];
//Pfade zu den Modulen e.g. modules/linegraph
var modulPaths=[];

//Suche ng-apps und füge diese hinzu
getElementsByAttribute('data-module',document.body).forEach(function(e){
    var appName= e.getAttribute("data-module");
    modulDeps.push(appName+"/controller");
    modulNames.push(appName);
    modulPaths[appName]="modules/"+appName;
});

/**
 * Konfiguriere requrie-js
 */
require.config({
    baseurl:"/js",
    // alias libraries paths
    //paths: globalPaths,
    paths:{
        'angular': 'vendor/angular',
        'angular-resource': 'vendor/angular-resource',
        'angular-animate': 'vendor/angular-animate',
        'angular-debounce': 'vendor/angular-debounce',
        'ng-tags-input': 'vendor/ng-tags-input',
        'ng-modal': 'vendor/ng-modal',
        //'tag-it': 'vendor/tag-it',
        'jquery': 'vendor/jquery.min',
        'd3': 'vendor/d3.min',
        'oauth':'vendor/oauth'
        //'vendor':'vendor'
    },

    // angular does not support AMD out of the box, put it in a shim
    shim: {
        'jquery':{
            exports:'jquery'
        },
        'd3':{
            exports:'d3'
        },
        'angular': {
            exports: 'angular',
            deps:["jquery"]
        },
        'angular-resource':{
            exports:'angular-resource',
            deps:["jquery","angular"]
        },
        'angular-animate':{
            exports:'angular-animate',
            deps:["jquery","angular"]
        },
        'ng-tags-input':{
            exports:'ng-tags-input',
            deps:["jquery","angular"]
        },
        'ng-modal':{
            exports:'ng-modal',
            deps:["jquery","angular"]
        },
        'angular-debounce':{
            exports:'angular-debounce',
            deps:["jquery","angular"]
        },
        'oauth':{
            exports:'oauth',
            deps:[]
        }
    }
});


//Extending paths here to support plugin-Autocomplete
require.config({
   paths:modulPaths
});

//Lade globale Scripts
require(globalDeps,function($,angular){
    $(function () { // using jQuery because it will run this even if DOM load already happened
        modulDeps.forEach(function(e){
            require([e]);
        });

        //lade Module und fasse in rootModule zusammen
        require(globalDeps.concat(modulDeps),function(){
            angular.module("rootModule",modulNames);
            //bootstrap angular
            angular.element(document).ready(function() {
                angular.bootstrap(document.body, ['rootModule']);
            });
        });


    });
});



