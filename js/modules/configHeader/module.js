/**
 * Created by Eugen Kochtyrew
 */

define([
    "angular",
    "ng-tags-input",
    "ng-modal",
    "modules/loginCheck/module"
], function(angular, storageHandler){

    return angular.module("configHeader", ["ngAnimate","ngTagsInput","ngModal","storageHandler","loginCheck","tools"])
        .run(function(hashtags, twitterObservation, intervalDelayHandler,$timeout, isLogged){ //Verwende run, da config keine Provider akzeptiert by design

            //ZufallsFarbe
            var rndColor1="",rndColor2="";

            /**
             * Aktuell können auch Farbwerte wie #cd8e enstehen, die Probleme verursachen können
             */
            while(rndColor1.length!=7){
                rndColor1='#'+Math.floor(Math.random()*16777215).toString(16)
            }
            while(rndColor2.length!=7){
                rndColor2='#'+Math.floor(Math.random()*16777215).toString(16)
            }

            //Lege für Test-Zwecke 2 default HashTags an
            //hashtags.add("#xbox360",rndColor1);
            //hashtags.add("#ps4",rndColor2);

            //Starte Observation
            //5000ms sind minimum => Twitterlimit: 180 requests / 15min => alle 5 Sekunden

            intervalDelayHandler.set(5000);

            //Timeout, da normalerweise gleichzeitig das CP offen ist und keine Darstellung läuft
            //verhindert, dass die Graphen auf die Hashtags zugreifen, bevor diese gesetzt wurden
            //Für demobetrieb NICHT löschen!!!!

            $timeout(function(){
                twitterObservation.init();
                if(isLogged.in){
                    twitterObservation.start();
                }
            },300);

        })
        .factory('versionRequest',function($resource){

            return $resource('VERSION',{},{
                method:"GET",
                responseType:"json"
            });


        });
});