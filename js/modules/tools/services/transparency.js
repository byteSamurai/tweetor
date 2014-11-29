/**
 * Created by: Alfred Feldmeyer
 * Date: 12.05.14
 * Time: 12:19
 */
define(["angular", "../module"
],function(angular){

    /**
     * Berechnet den korrekten Alpha-Tranzparenz-Wert in Abhängigkeit der Anzahl der Hashtags
     * @param amount anzahl der Hastags
     * @param factor um den reduziert wird
     * @returns {float}
     */
    return angular.module('tools.transparency',[])
        .value("transparency",function(amount,factor){
            return Math.pow(factor,amount);
        })
});
