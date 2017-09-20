/********************************************************************************************************
 * This route implements a RESTful service that calls the YELP API to get a list of bars for a specified
 * area. It is called like so: PUT bars/location/limit/offset. Limit must be 1 -- 50 and offset must be
 * 0 to 999 as specified in the YELP api documentation. It also creates a global object that keeps
 * track of the votes for each bar.
 ********************************************************************************************************/
"use strict";

var express = require('express');
var router = express.Router();


router.get('/:location/:limit/:offset', function (req, res, next) {
    const yelp = require('yelp-fusion');

    yelp.accessToken(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET).then(response => {

        let now = new Date().toDateString();

        if (!global.hasOwnProperty("votes")) {
            global.votes = {creationDate: now, bars: new Map()};
        } else {
            if (global.votes.creationDate != now) {
                global.votes.creationDate = now;
                global.votes.bars.clear();
            }
        }

        const client = yelp.client(response.jsonBody.access_token);

        client.search({
            term: 'bars',
            location: req.params.location,
            limit: req.params.limit,
            offset: req.params.offset
        }).then(response => {
            let businesses = [];

            for (let i = 0; i < response.jsonBody.businesses.length; i++) {
                let business = response.jsonBody.businesses[i].name;

                if (!global.votes.bars.has(business))
                    global.votes.bars.set(business, []);

                businesses.push({
                    name: business,
                    imageURL: response.jsonBody.businesses[i].image_url,
                    votes: global.votes.bars.get(business)
                });

            }
            res.send({total: response.jsonBody.total, businesses: businesses});
        }).catch(e => {
            console.log(e);
            res.send({});
        })
    })
});

module.exports = router;
