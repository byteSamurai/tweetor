/**
 * Created by Alfred Feldmeyer on 20.05.14.
 */
define(["angular","angular-resource","./intervalDelayHandler"],function(angular){
    const LOREM="Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Li lingues differe solmen in li grammatica, li pronunciation e li plu commun vocabules. Omnicos directe al desirabilite de un nov lingua franca: On refusa continuar payar custosi traductores. At solmen va esser necessi far uniform grammatica, pronunciation e plu sommun paroles. Ma quande lingues coalesce, li grammatica del resultant lingue es plu simplic e regulari quam ti del coalescent lingues. Li nov lingua franca va esser plu simplic e regulari quam li existent Europan lingues. It va esser tam simplic quam Occidental in fact, it va esser Occidental. A un Angleso it va semblar un simplificat Angles, quam un skeptic Cambridge amico dit me que Occidental es.Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Li lingues differe solmen in li grammatica, li pronunciation e li plu commun vocabules. Omnicos directe al desirabilite de un nov lingua franca: On refusa continuar payar custosi traductores. At solmen va esser necessi far uniform grammatica, pronunciation e plu sommun paroles.";

    const USERS={
        "supermom123":"https://pbs.twimg.com/profile_images/1228135696/drop_normal.png",
        "cookiemonster":"https://pbs.twimg.com/profile_images/661537476/cookiemonster_bigger.jpg",
        "tomchainey":"https://pbs.twimg.com/profile_images/1970698146/dick20cheney_bigger.jpg",
        "blubberbend":"https://pbs.twimg.com/profile_images/239839838/bernd_das_brot_bigger.jpg"
    };

    const MAX_FEEDS_PER_REQ=30;

    /**
     * WIRKLICH GUTE SORTIER-FUNKTION NACH Fisher–Yates
     * @see: http://bost.ocks.org/mike/shuffle/
     * @param array
     * @returns {*}
     */
    var shuffle=function shuffle(array) {
        var m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    };
    /**
     * Random-Function with Range
     * @param min
     * @param max
     * @returns {*}
     */
    var rand=function(min,max){
        return Math.random() * (max - min) + min;
    };


    var genSingleMockingBird=function(){
        var ret={};

        //Hole Benutzernamen
        var usernames = [];
        for(var k in USERS) usernames.push(k);

        //speichere Benutzernamen in return

        ret.user=usernames[Math.floor(Math.random()*usernames.length)];
        ret.link2user="http://twitter.com/"+ret.user;
        ret.user_pic=USERS[ret.user];

        var now= new Date();

        ret.created_at = now.getUTCDate();
        ret.id = now.getTime() * 2; //Wir nehmen an, dass der doppelte Timestamp reichen sollte

        var loremParts=LOREM.split(" ");
        loremParts=shuffle(loremParts);
        var minWordcount=10;
        var maxWordcount=loremParts.length;
        var wordcount=rand(minWordcount,maxWordcount)-1;
        var lorem_shuffeled_slice=loremParts.slice(0,wordcount);
        ret.msg=lorem_shuffeled_slice.join(" ");

        return ret;
    };

    /**
     * Liefert eine Menge an Mockout-Tweets
     */
    return angular.module('storageHandler.mockingBirds',[])

        .service("mockingBirds",function($timeout){
            this.get=function(joinedTags,cb){
                var ret={};

                var tags=joinedTags.hashtag.split(",");


                tags.forEach(function(e){
                    var feedCount=rand(1,MAX_FEEDS_PER_REQ);
                    ret[e]=[];

                    for(var x=0;x<feedCount;x++){
                        ret[e].push(genSingleMockingBird());
                    }

                });
                //simuliere Netzerklatenz
                $timeout(function(){
                    cb(ret);
                },100);

            }

        });
});