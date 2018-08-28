var express = require('express');
var router = express.Router();
var request = require('request');

//get table data
router.get('/', function(req, res, next) {
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
    var location;
    var radius = req.query.distance;
    var type = req.query.category.replace(/ /g, "+");
    var keyword = req.query.keyword.replace(/ /g, "+");
    // var type = req.query.category;
    // var keyword = req.query.keyword;
    var key = "AIzaSyBnwNs6rHcranRAsZKcYgdQMh2m6IWCS2Y";
    if (req.query.from == "here") {
        location = req.query.lat + "," + req.query.lon;
        url += "location=" + location + "&radius=" + radius + "&type=" + type + "&keyword=" + keyword + "&key=" + key;
        console.log(url);
        request(url,function (error,response,body) {
            res.send(body);
        })

    } else {
        var loc = req.query.location.replace(/ /g, "+");
        // var loc = req.query.location;
        var temp = "https://maps.googleapis.com/maps/api/geocode/json?address=" + loc + "&key=" + key;
        request(temp, function(error, response, body) {
            if (!error) {
                // console.log(body);
                var data = JSON.parse(body);
                var dataLat = data.results[0].geometry.location.lat;
                var dataLon = data.results[0].geometry.location.lng;
                location = dataLat + "," + dataLon;
                url += "location=" + location + "&radius=" + radius + "&type=" + type + "&keyword=" + keyword + "&key=" + key;
                console.log(url);
                request(url,function (error,response,body) {
                    res.send(body);
                })
            }
        });
    }

});

module.exports = router;
