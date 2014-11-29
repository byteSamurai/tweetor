/**
 * Created by: Alfred Feldmeyer
 */
define(["angular","./intervalDelayHandler","./twitterFeedHandlerFactory"],function(angular){

    return angular.module('storageHandler.twitterObservation',[
            'storageHandler.intervalDelayHandler' ,
            "storageHandler.twitterFeedHandlerFactory"
        ])
    /**
     * Events, die getriggert werden
     */
        .constant("EVENT",{
            NEW_TWEETS:"newTweets",
            INIT_GRAPHS:"initGraphs"
        })

    /**
     * Methoden, die in regelmäßigen Abständen nach Twitter-Feeds fragen
     */
        .service("twitterObservation",function($interval, hashtags, intervalDelayHandler, $resource,EVENT,twitterFeedHandlerFactory){
            var twitterFeeds=twitterFeedHandlerFactory.create(true);

            //Graphen initialisiert
            var graphsInitialized=false;

            //IntervalID
            var intervalID=null;

            //event definieren
            var initTweetEvent= $.Event( EVENT.NEW_TWEETS ),
                newTweetEvent = $.Event( EVENT.NEW_TWEETS );

            //Letzter Tweet
            var lastTweets=null; //Cache

            //Tag-Separator
            var SEPARATOR=",";

            //function, die Daten vom Server liest
            var getRESTdata=function(){

                //Füge Hashtags zusammen
                var tags=hashtags.getHashesAsArray();
                var tagCompound=tags.join(SEPARATOR);

                //Hole Daten vom Server
                twitterFeeds.get({hashtag:tagCompound},function(response){
                    newTweetEvent.tweets=[];
                    newTweetEvent.hashTags=[];
                    tags.forEach(function(e){
                        newTweetEvent.tweets[e]=response[e];
                        newTweetEvent.hashTags.push(e);
                    });
                    lastTweets=newTweetEvent;
                });


                //event abfeuern
                if(lastTweets!=null){
                    $.event.trigger(lastTweets);
                }else{ // Initialisierung mit leerem Tweetevent
                    initTweetEvent.tweets=[];
                    initTweetEvent.hashTags=[];
                    tags.forEach(function(e){
                        initTweetEvent.tweets[e]=[];
                        initTweetEvent.hashTags.push(e);
                    });
                    $.event.trigger(initTweetEvent);
                }
            };

            /**
             * Starte Observation
             */
            this.start=function(){
                //Graphen müssen initialisiert sein
                if(graphsInitialized!==true){
                    throw new Error("Graphen müssen zuerst initialisiert werden, bevor sie mit Hashtags beliefert werden");
                }
                //Läuft interval bereits?
                if(intervalID!=null){
                    return;
                }

                getRESTdata(); // fill cache
                intervalID=$interval(function(){
                    getRESTdata()
                },intervalDelayHandler.get());
            };

            /**
             * Beende Observation
             */
            this.stop=function(){
                $interval.cancel(intervalID);
                lastTweets=null; //cache leeren
                intervalID=null;
            };

            /**
             * Initialisiert graphen
             */
            this.init=function(){
                graphsInitialized=true;
                if(intervalID!==null){
                    throw new Error("Graphen sollten nich initialisiert werden, während sie mit hashtags beliefert werden");
                }
                var initGraphEvent = $.Event( EVENT.INIT_GRAPHS );
                $.event.trigger(initGraphEvent);
            };
            /**
             * Wird aktuell beobachtet
             * @returns {boolean}
             */
            this.isObserving=function(){
                return intervalID!=null;
            };

            /**
             * Schaltet auf Mock-Impementierung um
             * @param e
             */
            this.useMockingBirds=function(e){
                if(e===true){
                    twitterFeeds=twitterFeedHandlerFactory.create(true);
                }else{
                    twitterFeeds=twitterFeedHandlerFactory.create(false);
                }
            }
        });
});