/**
 * Created by Eugen Kochtyrew
 */

define([
    "angular",
    "./module",
    "modules/storageHandler/module",
    "modules/tools/module"
],function(angular,tweets){
    angular.module("tweets.service", ["storageHandler"])
        .service("tweets", function () {


        });

});