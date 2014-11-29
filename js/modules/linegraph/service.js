/**
 * Created by: Alfred Feldmeyer
 */
define([
    "angular",
    "d3",
    "./module",
    "modules/storageHandler/module",
    "modules/tools/module"
],function(angular,d3){
    angular.module("linegraph.service",["storageHandler","tools"])
    .service("graph",function(hashtags,hexToRgb,transparency,twitterObservation){
            var linegraphRoot;

            // define dimensions of graph
            var margin = {top:7, right:0, bottom:25, left:20};
            var lineStroke=2;
            var bufferTop=20; //Anzahl der Pixel, die der Graph ausserhalb der Scala nach oben einnehmen darf für Interpolationen
            var width =0; // width, default will be overwritten by resize-func.
            var height = 0; // height --^
            var timeBubbleCount=0;
            var $scope=null;

            this.calcDataMax=function(){
                var max=1;
                if($scope!=null){
                    max=d3.max(d3.values($scope.data),function(e){
                        return d3.max(e);
                    });
                    //nicht kleiner als 1!
                    max=max<1?1:max;
                }
                $scope.dataMax=max;
            };

            // Skalierung
            var yScale=function(){
                return d3.scale.linear().domain([0, $scope==null?1:$scope.dataMax]).range([height-margin.top-margin.bottom-lineStroke, 0]).nice();
            };
            var xScale=function(){
                return d3.scale.linear().domain([0, $scope==null?1:$scope.MAX_VISIBLE_VALUES-1]).range([0, width]);
            };

            //y-Achse
            var yAxis=d3.svg.axis().scale(yScale()).ticks(4).orient("left");

            /**
             * AreaFunction
             * @returns {*}
             */
            var area = function(){
                return d3.svg.area()
                    .interpolate($scope.linegraphmode())
                    .x(function(d,i) {return xScale()(i); })
                    // Doppelte höhe, damit der Graph nach unten genug "fläche" hat um ihn entlang
                    // der Y-Achse zu verschieben
                    .y0(height)
                    .y1(function(d) {return yScale()(d); });
            };

            /**
             * Aktualisert den Graphen
             * @param tag Hashtag der aktualisiert werden soll
             */
            this.updateLinegraph=function(tag){
                //Blende hinweis aus, falls vorhanden
                linegraphRoot.select(".resizing")
                    .classed({show:false,hide:true});

                yAxis = d3.svg.axis().scale(yScale()).ticks(4).orient("left");

                linegraphRoot.select('.y.axis')
                    .transition()
                    .ease("linear")
                    .duration($scope.INTERVALDELAY/4)
                    .call(yAxis);

                //Shift graph to the left side and ajusts scaling
                if( $scope.dataCount[tag] > $scope.MAX_VISIBLE_VALUES){
                    /**
                     * move Line
                     */
                    linegraphRoot.select('.area.'+tag.substring(1))
                        .classed({show:true,hide:false})
                        .data([$scope.data[tag]])
                        .attr("d", area())
                        .transition()
                        .ease("linear")
                        .attr("transform","translate("+ xScale()(-1) +")")
                        .duration($scope.INTERVALDELAY)
                        .each("start", function(){
                            while($scope.dataCount[tag] > $scope.MAX_VISIBLE_VALUES){
                                $scope.data[tag].shift(); // lösche ersten datenpunkt
                                $scope.dataCount[tag]--;
                            }
                            d3.select(this)
                                .attr("transform",null);
                        });

                }else {
                    //postfill Nullen
                    var fillNills=new Array($scope.MAX_VISIBLE_VALUES-$scope.dataCount[tag]+1).join('0').split('').map(parseFloat);
                    /**
                     * Squeeze da line
                     */
                    linegraphRoot.selectAll('.area.'+tag.substring(1))
                        .classed({show:true,hide:false})
                        .data([$scope.data[tag].concat(fillNills)])
                        .transition()
                        .duration($scope.INTERVALDELAY )
                        .attr("transform",null)
                        .attr("d", area());
                }
            };
            /**
             * Zeigt einen Rahmen an, der die Bewegung im Graphen illustriert
             */
            this.moveFrame=function(){
                var tag=hashtags.getHashesAsArray()[0];
                if( $scope.dataCount[tag] > $scope.MAX_VISIBLE_VALUES){
                    linegraphRoot.select(".moveframe")
                        .transition()
                        .ease("linear")
                        .attr("transform","translate("+ (50+xScale()(-1))  +")")
                        .duration($scope.INTERVALDELAY)
                        .each("start", function(){
                            d3.select(this)
                                .attr("transform","translate(50,0)");
                        });
                }
            };
            /**
             * Blendet den Frame ein
             */
            this.showFrame=function(e){
                if(e){
                    linegraphRoot.select(".moveframe")
                        .classed({"show":true,"hide":false})
                }else{
                    linegraphRoot.select(".moveframe")
                        .classed({"show":false,"hide":true})
                }
            };

            /**
             * Passt Graphen an die größe des div#linegraph an
             * wird aufgerufen bei erster initialisierung
             * oder by resize-event
             */
            this.resize=function(init){
                /* Find the new window dimensions */
                width = parseInt(linegraphRoot.style("width"));
                height = parseInt(linegraphRoot.style("height"));

                /* Update Area-Graph on resize*/

                if(init!==true){
                    hashtags.getHashesAsArray().forEach(function(e){
                        //postfill Nullen
                        var fillNills=new Array($scope.MAX_VISIBLE_VALUES-$scope.dataCount[e]+1).join('0').split('').map(parseFloat);

                        linegraphRoot.select(".area."+e.substring(1))
                            .data([$scope.data[e].concat(fillNills)])
                            .attr("d", area())
                    });
                    //Blende hinweis ein
                    linegraphRoot.select(".resizing")
                        .classed({show:true,hide:false});

                    linegraphRoot.selectAll(".area, .y.axis, .timebubbles>g")
                        .classed({show:false,hide:true})
                        .transition()
                        .each("end", function(){
                            yAxis = d3.svg.axis().scale(yScale()).ticks(4).orient("left");
                            d3.select(".y.axis")
                                .classed({show:true,hide:false})
                                .transition()
                                .call(yAxis);

                            //get graph offest
                            var offset=parseFloat(linegraphRoot
                                .select(".graphbox")
                                .attr("transform").match(/[0-9]{1,}/));

                            var translateHeight=height  - margin.bottom;


                            d3.selectAll(".timebubbles, .timebubbles>g")
                                .interrupt();
                            //timebubbles neu skalieren
                            d3.selectAll(".timebubbles>g")
                                .each(function(e,i){
                                    d3.select(this)
                                        .attr("transform","translate("+
                                        (xScale()(i+1)+offset) +","+translateHeight+")")
                                        .transition()
                                        .delay(500)
                                        .each("end",function(){
                                            d3.select(this).classed({show:true,hide:false})
                                        });

                                });
                            //Update Viewports
                            //fade in by update!
                            linegraphRoot
                                .attr("height", height)
                                .attr("width", width)
                                .select("rect")
                                .attr("width",width)
                                .attr("height",Math.abs(height-margin.top-margin.bottom+lineStroke+bufferTop))
                                .transition()
                                .delay(200)
                                .each("end",function(){
                                    d3.selectAll(".area")
                                        .attr("d", area());
                                });
                            //Frame initialisiern
                            linegraphRoot.select(".moveframe")
                                .attr("width",width)
                                .attr("height",Math.abs(height-margin.top-margin.bottom));

                            //Wenn graph nicht läuft:
                            if(!twitterObservation.isObserving()){
                                linegraphRoot.selectAll(".area")
                                    .classed({show:true,hide:false});
                                linegraphRoot.select(".resizing")
                                    .classed({show:false,hide:true});
                            }
                        });
                }
            };

            /**
             * Grundlegende Initialisierung Linegraph
             */
            this.bare_init=function(e){
                linegraphRoot=d3.select(e);

                this.resize(true); //initial resizing

                yAxis = d3.svg.axis().scale(yScale()).ticks(4).orient("left");

                linegraphRoot.select("g")
                        .attr("transform", "translate(0," + margin.top + ")");

                //add Clippath
                d3.select("#linegraphClip>rect")
                    .attr("width",width)
                    .attr("height",Math.abs(height-margin.top-margin.bottom+lineStroke+bufferTop))
                    .attr("y",-lineStroke-bufferTop)
                    .attr("x",lineStroke);

                //Fade in y-axis
                linegraphRoot.select('.y.axis')
                    .classed({show:true,hide:false})
                    .transition()
                    .call(yAxis);

                //Frame initialisiern
                linegraphRoot.select(".moveframe")
                    .attr("width",width)
                    .attr("height",Math.abs(height-margin.top-margin.bottom))
            };
            /**
             * Initialize the Graph with Hashtags and Colors
             */
            this.initHashtags=function(scope){
                $scope=scope;

                //reset
                resetGraph();

                //Füge Hashtag-graphen hinzu
                hashtags.getHashesAsArray().forEach(function(tag){
                    $scope.data[tag]=[];
                    $scope.dataCount[tag]=0;
                    addHashtagGraph(tag);
                });
            };
            /**
             * Initialisiert einen Line-Graphen für einen Tag
             * @param tag
             */
            var addHashtagGraph=function(tag){
                var clr=hashtags.getColor(tag);
                var clrRGB=hexToRgb(clr);

                //init-data-leine
                var initData=[];
                //Fülle auf Mindesmenge auf
                while(initData.length<$scope.MAX_VISIBLE_VALUES){
                    initData.push(0);
                }

                d3.select(".graphbox")
                    .append("svg:path")
                    .data([initData])
                    .attr("d", area())
                    .attr("class", "animate area "+tag.substring(1))
                    .style("stroke",clr)
                    .style("fill","rgba("+clrRGB.r+","+clrRGB.g+","+clrRGB.b+","+transparency(hashtags.getHashesAsArray().length,0.5)+")")
                    .transition()
                    .each("end",function(){
                        d3.select(this)
                            .classed({show:true,hide:false});
                    });
            };
            /**
             * Setzt die Werte des Graphen zurück
             */
            var resetGraph=function(){
                $scope.data=[];
                $scope.dataCount=[];

                linegraphRoot
                    .selectAll(".hashtags>*, .timebubbles>*")
                    .remove();

                linegraphRoot.select(".timebubbles")
                    .attr("transform",null);

                d3.select(".graphbox")
                    .selectAll(".area")
                    .remove();

                timeBubbleCount=0;
            };


            /**
             * Fügt Punkte ein und Zeigt die Laufzeit an
             * @type {*}
             */
            this.updateTimebubbles=function(){
                var currentCount=d3.max(d3.values($scope.dataCount));
                var xCoord=parseFloat(xScale()(currentCount));
                //get graph offest
                var offset=parseFloat(linegraphRoot
                    .select(".graphbox")
                    .attr("transform").match(/[0-9]{1,}/));

                var translateHeight=height  - margin.bottom;
                var insertBubble=function(){
                    var gScene=linegraphRoot.select(".timebubbles")
                        .append("svg:g");

                    gScene.attr("class","animate hide")
                        .attr("transform","translate("+(xCoord+offset) +","+translateHeight+")")
                        .transition()
                        .each("end",function(){
                            d3.select(this)
                                .classed({hide:false,show:true});
                        });

                    gScene
                        .append("svg:circle")
                        .attr("r",5);

                    var d = new Date();
                    /**
                     * Clever Method for leading zeros
                     * @see: http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date
                     */
                    gScene
                        .append("svg:text")
                        .text(('0' + d.getHours()).slice(-2)+":"+ ('0' + d.getMinutes()).slice(-2)+":"+ ('0' + d.getSeconds()).slice(-2));

                    timeBubbleCount++;
                };



                //Müssen bubbles nun verschoben werden?
                if(currentCount > $scope.MAX_VISIBLE_VALUES){
                    linegraphRoot
                        .select(".timebubbles")
                        .transition()
                        .ease("linear")
                        .attr("transform","translate("+ xScale()(-1) +",0)")
                        .duration($scope.INTERVALDELAY)
                        .each("start",function(){
                            d3.select(this).attr("transform",null);
                            d3.selectAll(".timebubbles>g")
                                .order()
                                .each(function(e,i){
                                    if(i==0 || i > timeBubbleCount ){//Entferne Erstes und überflüsige Elemente
                                        var gBubble=this;
                                        //d3.select(this).remove();
                                        d3.select(this)
                                            .attr("transform","translate("+
                                                (xScale()(i)+offset) +","+translateHeight+")")
                                            .selectAll("text,circle")
                                            .transition()
                                            .ease("cubic")
                                            .style("opacity",0)
                                            .duration($scope.INTERVALDELAY/6)
                                            .each("end",function(){
                                                d3.select(gBubble).remove();
                                            });

                                        timeBubbleCount--;
                                    }else{
                                        d3.select(this)
                                            .attr("transform","translate("+
                                                (xScale()(i)+offset) +","+translateHeight+")");
                                    }
                                    if(i>=timeBubbleCount){
                                        insertBubble();
                                    }
                                });

                        });
                }else{
                    //kein Punkt bei 01
                    if(xCoord>0 ){
                        insertBubble();
                    }
                }
            }
    });
});