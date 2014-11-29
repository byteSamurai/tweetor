/**
 * Created by Eugen Kochtyrew
 */

define(["./module"], function(configHeader){
    configHeader.controller("configHeaderController", function($scope,hashtags, twitterObservation,isLogged, versionRequest,$document,hsvToRgb){
        $scope.closedCP=true;
        $scope.openedCP=!$scope.closedCP;
        $scope.toggleCP = function () {
            //hashtags vorhanden?
            if($scope.tags.length<1){
                if($scope.openedCP){
                    return;
                }else{
                    $scope.toggleButtonDisabled=true;
                }
            }

            if($scope.tagsModified){
                twitterObservation.init();
                $scope.tagsModified = false;
            }
            if($scope.openedCP && $scope.graphsStopped){
                twitterObservation.start();
                $scope.cogIsRunning=true;
            }
            $scope.closedCP = !$scope.closedCP;
            $scope.openedCP=!$scope.closedCP;
        };
        //schaltet Tag/Nacht schema um
        $scope.toggleDayNight=function(){
            var daytheme="/css/day.css";
            var nighttheme="/css/night.css";
            var overlay=$("<div class=\"overlay\"></div>").hide();
            $("body").append(overlay);
            overlay.fadeIn(300,function(){
                var sheet=$("#stylesheet");
                if(sheet.attr("href")===daytheme){
                    sheet.attr("href",nighttheme)
                }else{
                    sheet.attr("href",daytheme)
                }
                $(this).fadeOut(300,function(){this.remove()});
            });
        };
        //deaktiviere visuell den Button
        $scope.toggleButtonDisabled=true;
        //rotiere das Cog-image
        $scope.cogIsRunning=false;

        $scope.graphsStopped=true;

        //Tweetor version
        $scope.VERSION=0;
        versionRequest.get({},function (e) {
            $scope.VERSION= e.version;
        });



        //prüft ob Twitter-Authentifizierung existiert
        $scope.$watch(function () {
                return isLogged.in;
            },
            function(newVal, oldVal) {
                $scope.loggedIn=newVal;
            }, true);
        $scope.loggedIn=isLogged.in;


        var getTagsFromStorage=function(){
            var tags=[];
            var storedTags=hashtags.getAll();
            for (var key in storedTags) {
                if (storedTags.hasOwnProperty(key)) {
                    tags.push({
                        text:key,
                        color:storedTags[key]
                    });
                }
            }
            return tags;
        };

        $scope.newTag = {text:'', color:''};
        $scope.colorPickeropen=false;

        //prüft ob sich die Tags geändert haben
        $scope.$watch(function () {
                return $scope.tags
            },
            function(newVal, oldVal) {
                //ggf. Button deaktivieren
                $scope.toggleButtonDisabled = newVal.length < 1;

                //Änderung eingetreten => graphen stoppen
                twitterObservation.stop();
                $scope.cogIsRunning=false;
                //Der jetzt eingefügte Tag wird nur solange angezeigt,
                //bis die Farbe eingefügt wurde
                $scope.tags.forEach(function(e){
                    if(e.text[0]!=='#'){
                        e.text="#"+ e.text;
                    }
                })
            }, true);
        $scope.tags = getTagsFromStorage();
        $scope.tagsModified = false;


        /**
         * Konvertiert 1-stellige RGB Werte in 3 Stellige für Umwandlung in Hex
         * @param c RGB Wert
         * @returns c 3 stelligen RGB Wert
         */
        $scope.rgbToHex = function(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        };

        $scope.expandRgb = function(c){
            while(c.length < 3){
                c = '0' + c;
            }
            return c;
        };

        $scope.hashAdded = function(e){
            $scope.tagsModified = true;
            //$scope.modifyHandler();
            if(e.text[0]!=='#'){
                e.text= '#' + e.text;
            }
            $scope.newTag.text =e.text;
            $scope.colorPickeropen=true;
        };

        $scope.addHashColor= function(r, g, b){
            var color=hsvToRgb(r,(g/100),(b/100));

            r = color.R;
            g = color.G;
            b = color.B;
            $scope.newTag.color = $scope.rgbToHex(r, g, b);
            //Update model
            $scope.tags.pop();
            $scope.tags.push($scope.newTag);
            $scope.colorPickeropen=false;
            //reset temporary storage object
            $scope.newTag = {text:'', color:''};
            //$scope.initNewHash();
            $scope.setNewHashTags();
        };

        /**
         * Übernimmt die Hashtags und Farben vom Model zum Service
         */
        $scope.setNewHashTags=function(){
            //removeall old tags
            hashtags.getHashesAsArray().forEach(function(e){
                    hashtags.remove(e);
                }
            );
            //add existing tags
            $scope.tags.forEach(function(e){
                hashtags.add(e.text, e.color);

            });
        };
        $scope.hashRemoved = function(){
            $scope.tagsModified=true;
            $scope.setNewHashTags();
        };

    });
});