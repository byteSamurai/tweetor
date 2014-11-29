/*
    created by Heiko Stange
 */

define(["angular", "./service", "d3"], function(angular){
        return angular.module('bubblechart', ["bubblechart.service","storageHandler","angular-debounce"])
            .directive('bubblechart', function (chart,debounce,$document,EVENT) {
            return{
                    restrict: 'A',
                    templateUrl:"/js/modules/bubblechart/bubblechartView.html",
                    link: function (scope, elem) {
                        //set svg dimensions
                        $(elem[0]).find("svg").attr("width",elem.width());
                        $(elem[0]).find("svg").attr("height",elem.height());

                        chart.init(elem[0]);

                        //... eine Funktion Sie alle zu binden, gnihihi
                        $(window).on('resize', debounce(200,function(){
                            chart.resize();
                        }));

                        $document.on(EVENT.INIT_GRAPHS,function(){
                            scope.initChart();
                        });
                    }
            };

    });

});
