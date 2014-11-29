/**
 * Created by: Alfred Feldmeyer
 */
define(["angular",
    "./services/hashtags",
    "./services/twitterObservation"
    ],function(angular){

    return angular.module('storageHandler',[
                                    'storageHandler.twitterObservation',
                                    'storageHandler.hashtags'
        ])
        .directive("mockingbirds", function(twitterObservation){
            return {
                restrict: 'E',
                replace:true,
                templateUrl:"/js/modules/storageHandler/mockingBirdsView.html",
                controller: function($scope){
                    $scope.datasource="mockup";
                    $scope.changeDataSource=function(){

                        if($scope.datasource=="mockup"){

                            twitterObservation.useMockingBirds(true);
                        }else{
                            twitterObservation.useMockingBirds(false);
                        }
                    }

                },
                link: function (scope, elem,attr) {

                }
            }
        });
});
