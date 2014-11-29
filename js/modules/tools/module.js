/**
 * Created by: Alfred Feldmeyer
 */
define(["angular",
    "./services/hexToRgb",
    "./services/hsvToRgb",
    "./services/transparency"
    ],function(angular){

    return angular.module('tools',[
        "tools.hexToRgb",
        "tools.hsvToRgb",
        "tools.transparency"
    ]);


});
