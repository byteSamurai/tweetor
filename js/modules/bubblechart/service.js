/*
 * created by Heiko Stange
 */


define([
    "angular",
    "./module",
    "d3",
    "modules/storageHandler/module",
    "modules/tools/module"
],function(angular,bubblechart, d3){
    angular.module("bubblechart.service", ["storageHandler"])
        .service("chart", function () {

        /*
            Konstanten deklarieren
         */

        const DELAY = 2000;

        /*
            Variablen deklarieren
         */
        var bubblechart;
        var MaxRadiusSizeForSmallCircles;
        var radiusScale;    //d3.scale Funktion um die Größe der Kreise zueinander zu skalieren
        var $scope;     //hier wird der scope manuell abgespeichert
        var radius;     // Radius des großen Kreises der alle anderen beinhaltet
        var sizeScaled = [];    //scalierte Radiusangaben der Kleinen Kreise
        var nodes;     //beinhaltet die daten und bildet diese auf ein d3 tree-layout ab
        var node;      //stellt die Kreise zu den in nodes aufgearbeiteten Daten dar
        var width ;    //Fensterbreite
        var height;    //Fensterhöhe
        var svg;       //SVG-Container in dem gezeichnet wird
        var tree;      //d3 layout
        var derotate=[];//array to store the value of the bubble rotation, to de-rotate the text
        var visible=[];
        var marginTop;
        /*
            Berechung der Maximal möglichen Kreisgröße für die Kleinen Kreise,
            dies wird benötigt um die Kreise zueinander und im Verhältniss der Daten zu skalieren
         */
        var scaleCircleToWindowsize=function(){
            if($scope.hashNames.length>1){
            if(width>height){
                MaxRadiusSizeForSmallCircles= (Math.sin((180/$scope.dataChart.length)*Math.PI/180)/(1+Math.sin((180/$scope.dataChart.length)*Math.PI/180)))*height/2;
            }else{
                MaxRadiusSizeForSmallCircles= (Math.sin((180/$scope.dataChart.length)*Math.PI/180)/(1+Math.sin((180/$scope.dataChart.length)*Math.PI/180)))*width/2;
            };
            //Ausnahmenbehandlung für den Fall das Sinus des Winkels negativ war
            if(MaxRadiusSizeForSmallCircles<0){
                MaxRadiusSizeForSmallCircles *=-1;
            };
            }else{
                if(width>height){
                    MaxRadiusSizeForSmallCircles= height/2;
                }else{

                    MaxRadiusSizeForSmallCircles= width/2;
                };
            }
        };


        /*
            Funktion um Bubblechart an Fenstergröße anzupassen
         */
        this.resize = function(){
            width = parseInt(bubblechart.style("width"));
            height = parseInt(bubblechart.style("height"))- marginTop;
            scaleCircleToWindowsize();
            updateRadiusScale();

           d3.select("#SVGbubblechart")
               .attr("width", width)
               .attr("height", height)

           d3.select("#circles")
               .transition().duration(DELAY).ease("elastic")
               .attr("transform","translate(" + width/2   + "," + height/2 + ")");

        };


        /*
           Löschen aller Bisherigen Daten und Objekte (svg-container)
         */
        this.resetChart = function(scope){
            $scope=scope
            $scope.dataChart  = [];
            $scope.size = [];
            $scope.sizeScaled =[];
            $scope.hashNames = [];
            $scope.inited=false;
            tree=null;
            derotate=[];
            visible=[];
           d3.selectAll(".node").remove();
        };

        this.initCircle=function(scope){
            $scope = scope;
            scaleCircleToWindowsize();
            updateRadiusScale();
            calculationForPositioning();
            updateTree();


            nodes=tree.nodes(hashes());
                node = svg.selectAll(".node")
                    .data(nodes.slice(1))
                    .enter()
                    .append("g")
                    .attr("class", 'node')
                    .attr("transform", function(d) {
                        return "rotate(" + (isNaN(d.x)?0: d.x) + ") translate(" +  (isNaN(d.y)?0:d.y) + ")";
                    });
                node.append("circle")
                    .attr("class", function(d){ return d.className.substring(1)})
                    .attr("r", 0)
                    .transition().duration(DELAY).ease("cubic")
                    .attr("r", function(d){ return isNaN(d.size)?0 : d.size;})
                    .attr("fill", function(d){ return  d.color;})
                    .attr("opacity" , 0.5);
                /*
                 *Prozentwert muss in cirles geprinted werden
                 */
                node.append("text")
                    .attr("class","label")
                    .html(function(d){ return  d.className; })
                    .attr("transform", function(d) {
                        return "rotate(" + ((isNaN(d.x)?0 : d.x*-1)) +  ")"})
                    .attr("opacity", 0);

                node.append("text")
                    .attr("dy", "1.2em")
                    .attr("class","percent")
                    .html(function(d){if(d.per >0){ return d.per + "% "}})
                    .attr("transform", function(d) {
                        return "rotate(" + ((isNaN(d.x)?0 : d.x*-1)) +  ")"});


/*
                if(nodes.length>1){
                    $scope.inited=true;
                }
  */
        };


        /*
            Initialisierungs Funktion
        */
        this.init = function(e){
           bubblechart =d3.select(e);
            marginTop =parseInt(bubblechart.select("h2").style("height"));

            width = parseInt(bubblechart.style("width"));
            height = parseInt(bubblechart.style("height")) - marginTop ;

           //append the svg to the window at the right bottom side (in the middle of the window so the circles can be placed in a circle around the svg center)

            svg = d3.select("#SVGbubblechart")
                .attr("width", width)
                .attr("height", height)
                .select("g")
                .attr("transform","translate(" + width/2   + "," + height/2 + ")");

        };


        /*
            Funktion um Radien der Kreise zueinander zu skalieren
        */
        var updateRadiusScale = function(){
            radiusScale = d3.scale.linear()
                .domain([0,d3.max(d3.values($scope.size))])
                .range([0,MaxRadiusSizeForSmallCircles]).nice();
        };




        var calculationForPositioning = function(){
             /*
              *Wir brauchen die scalierte Größe der Kreise ohne die eigentlichen Größen zu verfälschen
              * d.h. sizeScaled[]
             */
            $scope.hashNames.forEach(function(tag){
                sizeScaled[tag] = radiusScale($scope.size[tag]);
            });


            if(height>width){
                radius = (width/2)-d3.max(d3.values(sizeScaled)); //roughCircumference / (Math.PI * 2);
            }else{
                radius = (height/2)-d3.max(d3.values(sizeScaled));
            };

        };

        /*
            update die tree circle (radius changes)
         */
        var updateTree = function(){
            tree = d3.layout.tree()
                .size([360, radius])
                .separation(function(a, b) {
                    return a.size + b.size;
                });
        };


        /*
            Funktion um die Kreise zu zeichnen
        */
        this.drawBubble=function(){
            scaleCircleToWindowsize();
            updateRadiusScale();
            calculationForPositioning();
            updateTree();

                nodes=tree.nodes(hashes());
                node = svg.selectAll(".node")
                    .data(nodes.slice(1))
                    .enter();

                d3.selectAll(".node")
                    .transition()
                    .duration(DELAY)
                    .ease("elastic")
                    .attr("transform", function(d) {
                            if(!isNaN(d.x)){
                                derotate[d.className]= d.x*-1;
                            };
                            return "rotate(" + (isNaN(d.x)?0:d.x) + ") translate(" + (isNaN(d.y)?0:d.y) + ")";
                    });

                d3.selectAll(".node>circle").each(function(v){
                    var tag=v.className;
                    nodes.slice(1).forEach(function(e){
                        if(e.className==tag){
                            d3.select("circle."+tag.substring(1))
                                .datum(e)
                                .transition()
                                .duration(DELAY)
                                .ease("elastic")
                                .attr("r",function(d){

                                    if(!isNaN(d.size)){
                                        visible[d.className]=true;
                                    };
                                    return isNaN(d.size)?0 : d.size;
                                })
                                .attr("fill", $scope.dataChart[tag].color);

                            $("circle."+tag.substring(1)).siblings().next()
                                .html(function(){if(e.per >0){ return e.per + "%"}});
                        }
                    });
                });

                d3.selectAll(".node>text")
                    .attr("transform", function(d) {
                        return "rotate(" + ((isNaN(derotate[d.className])?1 : derotate[d.className])) +  ")"})
                    .attr("opacity",function(d){
                        if(visible[d.className]==true){
                            return 1;
                        }else{return 0;};
                    });

        };


            /*
             *Funktion zur Berechnung und konvertierung in SVG/d3 kompatible Daten
             */
        var hashes= function(){
            var classes = [];

            $scope.hashNames.forEach(function(d){
                classes.push({  className: $scope.dataChart[d].name,
                                size: sizeScaled[d] ,
                                color: $scope.dataChart[d].color ,
                                per: (Math.round(($scope.size[d]/d3.sum(d3.values($scope.size)))*1000)/10)})
            })

            return {children: classes};

        };

});

});
