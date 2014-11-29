/**
 * Created by Eugen Kochtyrew
 */

define(["./module"], function(tweets){
    tweets.controller("tweetsController", function($scope, $rootScope, EVENT, hashtags, twitterObservation){

        /**
         * Konstanten definieren
         */
        const TWEET_MSG_LENGTH = 250;
        const TWEET_CONTAINER_MAX_ELEMENTS_RANDOM = 5;
        const TWEET_CONTAINER_MAX_ELEMENTS_ALL = 30;


        $scope.tweetContainer=[];




        /**
         * Hole neue Tweets für den View
         */
        $scope.getTweets=function(e){


            $scope.tweetmode=function(){
                if($rootScope.tweetmode){
                    return $rootScope.tweetmode;
                }else{
                    return "random";
                }
            };

            // Hole aktuelle Hashtags
            $scope.currentTags = hashtags.getHashesAsArray();
            $scope.tagsWithTweets = [];

            // Suche Tags mit vorhandenen Tweets
            $scope.currentTags.forEach(function(tag){
                if(e.tweets[tag].length > 0){
                    $scope.tagsWithTweets.push(tag);
                }
            });

            var nextTweet={};
            if($scope.tagsWithTweets.length > 0){

                if($scope.tweetmode() == 'random'){

                    var randomTag = Math.round(Math.random() * (($scope.tagsWithTweets.length - 1) - 0)) + 0;
                    var randomTweet = Math.round(Math.random() * ((e.tweets[$scope.currentTags[randomTag]].length - 1) - 0)) + 0;

                    nextTweet = e.tweets[$scope.tagsWithTweets[randomTag]][randomTweet];
                    if(nextTweet==null){
                        return;
                    }
                    $scope.tweetUser = nextTweet.user;
                    $scope.userLink = nextTweet.link2user;
                    $scope.userPic = nextTweet.user_pic;
                    $scope.userMsg = nextTweet.msg;
                    $scope.randomTagColor = hashtags.getColor($scope.tagsWithTweets[randomTag]);

                    /**
                     * Schneidet MSG nach TWEET_MSG_LENGTH Zeichen ab und konkateniert "..."
                     */
                    if($scope.userMsg.length > TWEET_MSG_LENGTH){
                        $scope.userMsg = $scope.userMsg.slice(0, TWEET_MSG_LENGTH).concat('...');
                    }

                    /**
                     * Entfernt das erste Element im Tweet Container und rückt restliche nach
                     */
                    if($scope.tweetContainer.length >= TWEET_CONTAINER_MAX_ELEMENTS_RANDOM){
                        $scope.tweetContainer.shift();
                    }

                    /**
                     * Füllt das Array tweetContainer mit Inhalt für den View
                     */
                    $scope.tweetContainer.push({
                        user:$scope.tweetUser,
                        link:$scope.userLink,
                        pic:$scope.userPic,
                        msg:$scope.userMsg,
                        color:$scope.randomTagColor
                    });
                } else {


                    for(var i = 0; i <  $scope.tagsWithTweets.length; i++){

                        for(var j = 0; j < e.tweets[$scope.tagsWithTweets[i]].length; j++){
                            nextTweet = e.tweets[$scope.tagsWithTweets[i]][j];
                            if(nextTweet==null){
                                continue;
                            }
                            $scope.tweetUser = nextTweet.user;
                            $scope.userLink = nextTweet.link2user;
                            $scope.userPic = nextTweet.user_pic;
                            $scope.userMsg = nextTweet.msg;
                            $scope.randomTagColor = hashtags.getColor($scope.tagsWithTweets[i]);


                            if($scope.userMsg.length > TWEET_MSG_LENGTH){
                                $scope.userMsg = $scope.userMsg.slice(0, TWEET_MSG_LENGTH).concat('...');
                            }

                            if($scope.tweetContainer.length >= TWEET_CONTAINER_MAX_ELEMENTS_ALL){
                                $scope.tweetContainer.shift();
                            }

                            $scope.tweetContainer.push({
                                user:$scope.tweetUser,
                                link:$scope.userLink,
                                pic:$scope.userPic,
                                msg:$scope.userMsg,
                                color:$scope.randomTagColor
                            });
                        }

                    }

                }


            } else {
                return;
            }
        };

        $scope.initTweets = function(){
            $scope.tweetContainer=[];
        }
    });
});