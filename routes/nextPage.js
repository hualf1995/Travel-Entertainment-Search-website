var express = require('express');
var router = express.Router();
var request = require('request');

//get next page data
router.get('/', function(req, res, next) {
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
    var key = "AIzaSyBnwNs6rHcranRAsZKcYgdQMh2m6IWCS2Y";
    url += "pagetoken=" + req.query.pagetoken;
    url += "&key=" + key;
    console.log(url);
    request(url,function (error,response,body) {
        res.send(body);
    })

});

module.exports = router;
