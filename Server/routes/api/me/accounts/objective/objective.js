var express = require('express');
var router = express.Router();

router.post('/', function (req, res) {

    let { account, user } = req;
    let { followers } = req.body

    // TODO READ account.follower on instagram

    if( account.objective.followers ){

        return res.status(409).send({
            success: false
        })
    }

    let objective = {
        followers,
        begin_at: account.followers
    };

    account.objective = objective;

    user.save(err=>{

        if( err ){
            return res.status(400).send({
                success: false
            })
        }

        res.send({
            success: true,
            data:{
                objective
            }
        });
    });
});

router.delete('/', function (req, res) {

    let { account, user } = req;

    if( !account.objective.followers ){

        return res.status(409).send({
            success: false
        })
    }

    account.objective={};
    account.save()

    user.save(err=>{
        
        if( err ){
            return res.status(400).send({
                success: false
            })
        }
        res.send({
            success: true
        });
    })

});

module.exports = router;
