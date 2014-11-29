/**
 * Created by: Alfred Feldmeyer
 */
define(["angular","angular-resource"],function(angular){

    //Url zu den Feeds
    const TWEETURL="/rest/twitter/getfeeds/:hashtag";

    return angular.module('storageHandler.twitterFeedHandler',["storageHandler.intervalDelayHandler"])

        .service("twitterFeedHandler",function($timeout,$rootScope,intervalDelayHandler){
            const MAX_TWEETS=1000;
            var cached_ids=[];
            const CACHE_SIZE=300;
            /**
             * Such in einem Array nach String
             * Groß/Kleinschreib wird nich beachtet
             */
            var inArrayCaseInsensitve=function(haystack,needle){

                var rslt = null;
                $.each(haystack, function(index, value) {
                    if (rslt == null && value.text.toLowerCase()===needle) {
                        rslt = index;
                    }
                });
                return rslt!==null;
            };
            this.get=function(joinedTags,cb){
                var now=new Date().getTime();
                var tags=joinedTags.hashtag.split(",");
                var encodedQuery=encodeURIComponent(tags.join(" OR "));
                $rootScope.twitter.get('/1.1/search/tweets.json?q='+encodedQuery+"&count="+MAX_TWEETS+"&result_type=recent")
                    .done(function(data) {

                        var ret={};
                        var minTimeStamp=parseInt(now-60*1000);
                        var maxTimeStamp=parseInt(minTimeStamp+intervalDelayHandler.get());



                        /**
                         * Da die Twitter Api, die Daten nicht in Echtzeit liefert, betrachten wird die vergangene Minute
                         * d.h. wenn wir um 20:55:10 abfragen sind alle Tweets im Zweitfenster von 20:54:10 + intervalZeit von interesse
                         */
                        tags.forEach(function(tag){
                            ret[tag]=[];
                            //init cache
                            if(!cached_ids[tag]){
                                cached_ids[tag]=[];
                            }
                            //console.log("Sucheregebnisse "+data.statuses.length);
                            data.statuses.forEach(function(e){

                                if(Date.parse(e.created_at) >= minTimeStamp && Date.parse(e.created_at) <= maxTimeStamp  && $.inArray(e.id,cached_ids[tag])==-1){
                                    cached_ids[tag].push(e.id);
                                    while(cached_ids[tag].length>CACHE_SIZE){
                                        cached_ids[tag].shift();
                                    }
                                    var tagWithoutPrefix=tag.substr(1);
                                    //suche nach Tag in tweet
                                    if(inArrayCaseInsensitve(e.entities.hashtags,tagWithoutPrefix)){
                                        /**
                                         * Vorgabe aus Mockup
                                         * { created_at: 1403111238844
                                         * id: 2806222477688
                                         * link2user: "http://twitter.com/cookiemonster"
                                         * msg: "Li del in it Lor uniform va scientie, nov far"
                                         * user: "cookiemonster"
                                         * user_pic: "https://pbs.twimg.com/profile_images/661537476/cookiemonster_bigger.jpg"
                                         * }
                                         */
                                        //console.log(e.text);
                                        var tweet=[];
                                        tweet["created_at"]= e.created_at;
                                        tweet["id"]= e.id;
                                        tweet["link2user"]= "http://twitter.com/"+ e.user.name;
                                        tweet["msg"]= e.text;
                                        tweet["user"]= e.user.name;
                                        tweet["user_pic"]= e.user.profile_image_url;
                                        ret[tag].push(tweet);

                                    }
                                }
                            });
                        });
                        cb(ret);
                    });




            }

        });
});