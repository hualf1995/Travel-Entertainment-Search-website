var express = require('express');
var router = express.Router();

var yelp = require('yelp-fusion');
router.get('/', function(req, res, next) {

    var client = yelp.client('two0KykLY1vx_UUpTRlhEX21-20wOBHaR2jBQvJLeADg_LCZCW8ZI8w2qfBwyQHCLt1VH6Qyb9kReBa1iWhE08os6_lSMmpck-CDmKWAfqPcA47-ZTnW25xsL0LNWnYx');
    var id = req.query.id;
    client.reviews(id).then(function (response)  {
        res.send(response);
    }).catch(function (e) {
        console.log(e);
    });
});

module.exports = router;
