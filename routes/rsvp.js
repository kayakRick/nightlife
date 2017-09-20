/********************************************************************************************************
 * This route implements a RESTful service that updates a global count of RSVPs for each bar. The
 * format of the call is PUT rsvp/business/login. If the login already exists in the votes array
 * for the business (bar) it is removed, otherwise it is added. In either case, the business and
 * the updated votes array is returned to the caller. A 404 is returned if the business doesn't
 * exist in the global object.
 ********************************************************************************************************/
"use strict";

var express = require('express');
var router = express.Router();


router.put('/:business/:login', function (req, res, next) {
    let business = req.params.business;
    let login = req.params.login;

    if(global.votes.bars.has(business)){
        let votes = global.votes.bars.get(business);
        let going = votes.find(element => element == login);
        let newVotes = [];

        if(going) {
            votes.forEach(element => {
                if (element != login)
                    newVotes.push(element);
            });
        }else{
            newVotes = votes;
            newVotes.push(login);
        }

        global.votes.bars.set(business, newVotes);
        res.send({business: business, votes: newVotes});
    }else
        res.sendStatus(404);
});

module.exports = router;
