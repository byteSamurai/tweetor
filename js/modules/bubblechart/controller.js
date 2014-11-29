/*
        crated by Heiko Stange
 */

define(["./module"], function(bubblechart){


    bubblechart.controller("bubblechartController", function($scope,$document, chart, EVENT, hashtags){
        $scope.dataChart = [];
        var start = 0;
        $scope.size = [];

        $scope.hashNames = [];
        $scope.inited=false;

        $scope.initChart = function(){
            hashtags.getHashesAsArray().forEach(function(tag){
                if(!$scope.dataChart[tag]){
                    $scope.hashNames.push(tag);
                    $scope.dataChart[tag]= {size: 0 , pos: {x:0 , y:0} , color: hashtags.getColor(tag), name: tag};
                };
            });

            chart.initCircle($scope);
        };
        $document.on(EVENT.NEW_TWEETS,function(d){

            //gets the hashes with all there data as an array and stores them in variables
            hashtags.getHashesAsArray().forEach(function(tag){
                if(d.tweets[tag].length == 0){}else{
                    //if the hash appears the first time it gets a new entry in the data
                    if(!$scope.dataChart[tag]){
                        $scope.inited=false;
                        $scope.hashNames.push(tag);
                        $scope.dataChart[tag]= {size: 0 , pos: {x:0 , y:0} , color: hashtags.getColor(tag), name: tag};
                    };

                    //set the circle size avoid division trough 0
                    $scope.dataChart[tag].size += d.tweets[tag].length;


                    $scope.dataChart.length = d.hashTags.length;

                    //set the size in an separate array so calculations can be done more easily
                    $scope.size[tag] = $scope.dataChart[tag].size;


                };
         });

            //call methode to display the data as a circle
            chart.drawBubble($scope);

        });

        $document.on(EVENT.INIT_GRAPHS,function(){
            chart.resetChart($scope);

        });




    })
})
