/**
 * Created by: Alfred Feldmeyer
 * Date: 12.05.14
 * Time: 12:19
 */
define(["angular", "../module"
],function(angular){

    /**
     * Wandelt Hexwerte in RGB Werte um
     * @param hex
     * @returns {{r: Number, g: Number, b: Number}}
     */

    return angular.module('tools.hexToRgb',[])
        .value("hexToRgb",function(hex){
            var result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        })
});
