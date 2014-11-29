# Tweetor

Tweetor is a multi module angular app which aims to make high frequent tweets observable.

We used following components besides common stuff like angular, require.js and d3 jquery:

* [angular debounce](https://github.com/rubenv/angular-debounce)
* [ngTagsInput](http://mbenford.github.io/ngTagsInput)
* [ngModal](https://github.com/adamalbrecht/ngModal)

This project was part of my course work.
Contributers:
* Heiko Stange
* Eugen Kochtyrew

## Installation
 
We were not allowed by our professor to use any server side technology. So we ended up using (outh.io).

1. Please register at (oauth.io)
2. Authorize Twitter-Access
3. Enter your domain which will host tweetor and copy the public key into [oauthio.key.js](../gui-project/master/oauthio.key.js)
4. Add Twitter as provider by create an app at (https://apps.twitter.com/) and copy your consumer-key and consumer secret to oauth.io
5. ___PLEASE NOTE___: Mockingbirds are Mock-Messages. If you like to observer real messages you have to select "Twitter Tweets"
![oauth.io](https://raw.githubusercontent.com/fr3dm4n/gui-project/master/docs/oauth.io.png)


## Note about the code quality
This project has never seen any tests, (even if they were planned) and needs to be refactored.
Feel free to use it.


