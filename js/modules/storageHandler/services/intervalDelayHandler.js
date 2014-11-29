/**
 * Created by: Alfred Feldmeyer
 */
define(["angular","angular-resource"],function(angular){

    return angular.module('storageHandler.intervalDelayHandler',[])
        .service("intervalDelayHandler",function(){
            this.interval=1000; // default-wert
            this.get=function(){
                return this.interval;
            };
            this.set=function(i){
                this.interval=i;
            }
        }
    )
});