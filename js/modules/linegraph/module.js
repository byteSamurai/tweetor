/**
 * Created by: Alfred Feldmeyer
 */
define([
    "angular",
    "d3",
    "./service",
    "angular-debounce"
], function (angular) {
        return angular.module('linegraph', ["linegraph.service","storageHandler","angular-debounce","ngAnimate"])
            .directive('linegraph', function (graph,debounce,$document,EVENT) {
                return {
                    restrict: 'A',
                    templateUrl:"/js/modules/linegraph/linegraphView.html",
                    link: function (scope, elem) {
                        //set svg dimensions
                        $(elem[0]).find("svg").attr("width",elem.width());
                        $(elem[0]).find("svg").attr("height",elem.height());

                        graph.bare_init(elem[0]);

                        //... eine Funktion Sie alle zu binden, gnihihi
                        $(window).on('resize', debounce(200,function(){
                            graph.resize(false);
                        }));
                        //Aktualisiere Graphen
                        $document.on(EVENT.NEW_TWEETS,function(e){
                            scope.updateGraph(e);
                        });
                        //INitialisiere Graphen
                        $document.on(EVENT.INIT_GRAPHS,function(){
                           scope.initGraph();
                        });
                        //bei gedrückter Alt-Taste ins Fenster klicken um Move Frame anzuzeigen
                        elem.find(".moveframe")
                            .attr("transform",$(".axis.y").attr("transform"));


                        elem.on("click",function(e){
                            graph.showFrame(e.altKey);
                        });
                    }
                }
            }).
            directive("linegraphcontroll", function($rootScope){
                return{
                    restrict:"E",
                    replace:true,
                    scope:false,
                    templateUrl:"/js/modules/linegraph/linegraphControlView.html",
                    link: function(scope, elm, attrs) {

                        //onchange
                        elm.find("input").val(['linear']).bind('change', function() {
                            $rootScope["linegraphmode"]=$(this).val();
                        });
                    }
                }
            });

    });


