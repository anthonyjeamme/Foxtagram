var express = require('express');
var router = express.Router();

var { User } = require('../../database/database');
var { checkJwt } = require('../../auth/auth');

var me_route = require('./me/me');

function createOrLoadUser(req, res, next) {

    let userid = req.user.sub;

    User.findOne({ id: userid }, function (err, user) {

        if (user) {

            req.user = user;
            next();
        } else {

            user = new User({
                id: userid,
                accounts: [],
                account_type: "FREE",
                account_type_end_dt: null
            });

            user.save((err) => {
                if (err) {

                    console.log(err)
                    return res.status(500).send({
                        success: false
                    })
                }

                req.user = user;
                next();

            });
        }
    });
}

router.get("/", (req,res)=>{

    res.send({
        success: true
    });
});

router.use("/me", checkJwt, createOrLoadUser, me_route );

module.exports = router;
