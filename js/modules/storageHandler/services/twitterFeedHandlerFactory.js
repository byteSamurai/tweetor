/**
 * Created by: Alfred Feldmeyer
 */
define(["angular","angular-resource","./mockingBirds","./twitterFeedHandler"],function(angular){

    return angular.module('storageHandler.twitterFeedHandlerFactory',["storageHandler.twitterFeedHandler","storageHandler.mockingBirds"])
        .service("twitterFeedHandlerFactory",function(twitterFeedHandler,mockingBirds){


            /**
             * erzeugt eine Instanz des Data bzw. Request-resourceobjects
             * Dient unter anderem um Umschalten zwischen Mockup und REST-Anbindung
             */
            this.create=function(asMockup){
                if(asMockup===true){
                    return mockingBirds;
                }else{
                    return twitterFeedHandler;
                }

            }
        }
    )
});