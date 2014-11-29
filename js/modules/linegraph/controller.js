/**
 * Created by: Alfred Feldmeyer
 */
define(["./module", "d3"],function(linegraph, d3){


    linegraph.controller(
        "linegraphController",
        function($scope,$rootScope,graph,$document,EVENT,intervalDelayHandler, hashtags ,$timeout,$interval) {
            /**
             * Daten die Dargestellt werden
             * @type {Array}
             */
            $scope.data=[];

            /**
             * Anzahl der Werte in data
             * müssen statisch erfasst werden, da data.length sonst zu Problemen bei Transition führen würde
             * @type {Array}
             */
            $scope.dataCount=[];

            /**
             * Maximal sichtbare Werte
             * Sind mehr als maxDataCount Werte in data vorhanden wird der erste Wert enfernt
             * @type {number}
             */
            $scope.MAX_VISIBLE_VALUES=10;

            $scope.dataMaxPerHashtag={};

            $scope.INTERVALDELAY=intervalDelayHandler.get();

            /**
             * Hashtags und farben
             * @returns {*}
             */
            $scope.hashtags=[];
            /**
             * Hashtag farben
             * @type {{}}
             */
            $scope.colors={};
            /**
             * Zeige hashtags an?
             * @type {boolean}
             */
            $scope.showHashtags=false;

            /**
             * Maximalwerte
             * @type {number}
             */
            $scope.dataMax=1;


            $scope.linegraphmode=function(){
                if($rootScope.linegraphmode){
                    return $rootScope.linegraphmode;
                }else{
                    return "linear";
                }

            };
            /**
             * Animiert das einfügen neuer Werte
             * @param tag
             * @param v
             */
            var setNewPeak=function(tag,v){
                var interv;

                interv=$interval(function(){
                    if(v<=$scope.dataMaxPerHashtag[tag]){
                        $interval.cancel(interv);
                    }else{
                        $scope.dataMaxPerHashtag[tag]++;
                    }
                },50);
            };
            /**
             * Initialisiert Graphen
             */
            $scope.initGraph=function(){
                //Speichere Farben und Tags
                $scope.hashtags=[];
                hashtags.getHashesAsArray().forEach(function(tag){
                    $scope.hashtags.push(tag);
                    $scope.dataMaxPerHashtag[tag]=0;
                });
                $scope.colors=hashtags.getAll();

                graph.initHashtags($scope);
                //to trigger transaction
                $timeout(function(){$scope.showHashtags=true;},100);
            };
            /**
             * Update graph
             */
            $scope.updateGraph=function(e){

                hashtags.getHashesAsArray().forEach(function(tag){
                    $scope.dataCount[tag]=$scope.data[tag].length;

                    var amount=e.tweets[tag].length;
                    $scope.data[tag].push(amount);
                });
                //nun die neuen y-scales berechnen um einheitliche Werte zu bekommen
                graph.calcDataMax();

                //Durchführung in 2 Schleifen notwendig um yScalierung konkret anpassen zu können
                hashtags.getHashesAsArray().forEach(function(tag){
                    //speichere max per Tag
                    setNewPeak(tag,d3.max($scope.data[tag]));
                    graph.updateLinegraph(tag);
                });
                graph.updateTimebubbles();
                //Funktion veranschaulicht nur animation
                graph.moveFrame();

            }
        }
    );
});

