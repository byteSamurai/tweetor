/**
 * Created by: Alfred Feldmeyer
 */
define(["angular",
    "angular-resource",
    "oauth",
    "/oauthio.key.js"
    ],function(angular){

    return angular.module('loginCheck',['ngResource'])
        .service("isLogged",function(){
            this.in=false;
        })
        .directive('logincheckbutton', function (isLogged) {

            return {

                restrict: 'E',
                replace:true,
                templateUrl:"/js/modules/loginCheck/loginCheckView.html",
                controller: function($scope,$rootScope){


                    OAuth.initialize(OAUTHIO_KEY);
                    $scope.connect = function() {
                        OAuth.popup("twitter", function(err, res) {
                            if (err){
                                return console.log(err);
                            }
                            isLogged.in=true;

                            $scope.toggleCP();
                            $rootScope.$apply();
                            //Save 4 later usesag
                            $rootScope.twitter = res;
                        });
                    }

                },
                link: function (scope, elem) {}
            }
        });
});
