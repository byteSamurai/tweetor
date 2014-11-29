/**
 * Created by: Alfred Feldmeyer
 */
define(["angular","angular-resource"],function(angular){

    return angular.module('storageHandler.hashtags',[])

        .service("hashtags",function(){
            //Hashtag:#HEXWERT
            var hashtagsAndColors={};
            /**
             * Fügt einen Hashtag und einen Farbwert ein
             * @param hashtag String mit Namen
             * @param color
             */
            this.add=function(hashtag,color){
                if(typeof hashtag !== 'string' && !hashtag instanceof String || hashtag[0]!=="#"){
                    throw new Error("1. Parameter 'HashTag' muss ein String sein und mit # beginnen")
                }
                if(typeof color !== 'string' && !color instanceof String || color[0]!=="#" || color.length>7 ||color.length<4){
                    throw new Error("2. Parameter 'color' ("+color+") muss ein 4 bis 7-stelliger sein und mit # beginnen")
                }
                hashtagsAndColors[hashtag.toString()]=color;
            };
            /**
             * Liefert die Farbe eine Hashtags
             * @param hashtag
             * @returns {*}
             */
            this.getColor=function(hashtag){
                if(hashtagsAndColors[hashtag] === undefined){
                    return false;
                }
                return hashtagsAndColors[hashtag];
            };
            /**
             * Liefert alle hastTags als Schlüssel und die ensprechenden Farben als Werte
             * @returns {{}}
             */
            this.getAll=function(){
                return hashtagsAndColors;
            };

            /**
             * Liefert Tags als array ohne Farben
             * @returns {Array}
             */
            this.getHashesAsArray=function(){
                var tags=[];
                for (var key in hashtagsAndColors) {
                    if (hashtagsAndColors.hasOwnProperty(key)) {
                        tags.push(key);
                    }
                }
                return tags;
            };
            /**
             * Löscht einen Hashtag samt seiner Farbe
             * @param hashtag
             * @returns {boolean}
             */
            this.remove=function(hashtag){
                if(hashtagsAndColors[hashtag] !== undefined){
                    delete hashtagsAndColors[hashtag];
                }
                return true; //Wenn nicht vorhanden=> Everything is fine!
            }
        });

});
