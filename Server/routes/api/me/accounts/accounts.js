var express = require('express');
var router = express.Router();

var objective_route = require('./objective/objective');
var spys_route = require('./spys/spys');

var { createAccount } = require('database');

router.post('/', function (req, res) {

    let { username, password } = req.body;
    let { user } = req;

    if( user.accounts.filter( a => a.username === username ).length > 0 ){
        
        return res.status(409).send({
            success: false
        });
    }

    let account = createAccount( username, password );

    user.accounts.push( account );
    user.save()

    res.send({
        success: true,
        data: {
            account
        }
    });
});


router.post('/:accountid/run', function (req, res) {

    let { user } = req;
    let { value } = req.body;
    let { accountid } = req.params;
    
    if( user.accounts.filter( a => a.id === accountid ).length === 0 ){
        
        return res.status(404).send({
            success: false,
            error: "not found"
        });
    }

    user.accounts.forEach( a=>{

        if( a.id === accountid ){
            a.run = value
        }
    })

    user.save((err)=>{

        if( err ){

            return res.status(400).send({
                success: false,
                err
            });
        }

        res.send({
            success: true
        });
    });
});

router.patch('/:accountid/password', function (req, res) {

    let { user } = req;
    let { password } = req.body;
    let { accountid } = req.params;

    if( user.accounts.filter( a => a.id === accountid ).length === 0 ){
        
        return res.status(404).send({
            success: false,
            error: "not found"
        });
    }

    user.accounts.forEach( a=>{

        if( a.id === accountid ){
            a.password = password
        }
    })

    user.save((err)=>{

        if( err ){

            return res.status(400).send({
                success: false,
                err
            });
        }

        res.send({
            success: true
        });
    });
});

router.delete('/:accountid', function (req, res) {

    let { user } = req;
    let { accountid } = req.params;

    if( user.accounts.filter( a => a.id === accountid ).length === 0 ){
        
        return res.status(404).send({
            success: false
        });
    }

    user.accounts = user.accounts.filter( a => a.id !== accountid );
    user.save();

    res.send({
        success: true
    });
});

function saveAccountID ( req,res,next ){

    let { accountid } = req.params;
    let { user } = req;

    let search = user.accounts.filter( a => a.id === accountid );

    if( search.length === 0 ){
        
        return res.status(404).send({
            success: false
        });
    }

    req.account = search[0];

    next()
}

router.use('/:accountid/objective', saveAccountID, objective_route);
router.use('/:accountid/spys', saveAccountID,  spys_route);

module.exports = router;
