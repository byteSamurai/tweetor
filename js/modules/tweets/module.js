/**
 * Created by Eugen Kochtyrew
 */

define(["angular", "./service"], function(angular){
    return angular.module('tweets', ["tweets.service","storageHandler","angular-debounce", "ngAnimate"])
        .directive('tweets', function (chart,debounce,EVENT,$document) {
            return{
                restrict: 'A',
                templateUrl:"/js/modules/tweets/tweetsView.html",
                link: function (scope) {

                    $document.on(EVENT.NEW_TWEETS,function(e){
                        scope.getTweets(e);
                    });

                    $document.on(EVENT.INIT_GRAPHS,function(){
                        scope.initTweets();
                    });

                }
            };

        }).
        directive("tweetscontrol", function($rootScope){
            return{
                restrict:"E",
                scope:false,
                replace:true,
                templateUrl:"/js/modules/tweets/tweetsControlView.html",
                link: function(scope, elm, attrs) {


                    //onchange
                    elm.find("input").val(['random']).bind('change', function() {
                        $rootScope["tweetmode"]=$(this).val();
                    });

                }
            }
        });

});


