const express = require('express');
const app = express();
var opn = require('opn');
var network = require('network');

import {DAYS, HOURS, MINUTES} from '../lib/smartwait';

import { readConfigFile, saveConfigFile, getAppUserFolder } from '../lib/misc'
var Config = readConfigFile();

import { timeout } from '../lib/misc';

var fs = require('fs');

var running = false;

var bodyParser = require('body-parser')

var server = null;

var request = require('request');
var helmet = require('helmet');

var publicip = null;
var privateip = null;

network.get_public_ip(function(err, ip) {
    publicip = ip;
});

network.get_private_ip(function(err, ip) {
    privateip = ip;
});

const start = (database, logger, port=44333) => {

    app
    .use( helmet() )
    .use('/api/*',bodyParser.json())
    .use('/api/*',bodyParser.urlencoded({
        extended: true
    }))
    .use('/api/*',function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    })
    .options('/api/*', function (req, res) {

        res.end(JSON.stringify({
            "origin": "*",
            "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
            "preflightContinue": false,
            "optionsSuccessStatus": 204
        }));
    });
    
    app.get('/api/ping', function(req,res){

        res.end(JSON.stringify({
            success:true
        }))
    });

    app.post('/api/unblocklegacyusers', function(req, res){

        let { n_keep } = req.body;
        
        database.unBlockLastLegacyUsers( n_keep );
        
        res.end(JSON.stringify({
            success:true
        }))
    });

    app.post('/api/params/key/:key', function(req,res){

        let { key } = req.params;
        
        Config = readConfigFile();
        Config.key=key;
        
        saveConfigFile( Config );

        res.end(JSON.stringify({
            success:true
        }));
    });

    app.post('/api/mainaccountage',function(req,res){

        let age = parseInt(req.body.age);

        Config = readConfigFile();
        Config.accounts.main.creation_dt=Date.now() - age*DAYS;
        
        saveConfigFile( Config );
        
        res.end(JSON.stringify({
            success:true
        }))
    });

    app.post('/api/otheraccount',function(req,res){

        let login = req.body.username;
        let password = req.body.password;

        Config = readConfigFile();

        Config.accounts.others = [{
            login,
            password
        }];

        saveConfigFile( Config );
        
        database.setOtherAccountLoginError( login, false );

        res.end(JSON.stringify({
            success:true
        }))
    });

    app.post('/api/mainaccount',function(req,res){

        let login = req.body.username;
        let password = req.body.password;

        Config = readConfigFile();

        Config.accounts.main.login = login;
        Config.accounts.main.password = password;

        saveConfigFile( Config );

        database.setMainAccountLoginError( false );
        
        res.end(JSON.stringify({
            success:true
        }))
    });

    app.get('/api/params', function (req, res) {

        let params = database.getParams();

        Config = readConfigFile();
        
        res.end(JSON.stringify({
            success:true,
            params,
            follower_periods: Config.follower.periods,
            mainAccount:Config.accounts.main.login,
            otherAccounts:Config.accounts.others.map( e=>e.login ),
            privateip,
            publicip
        }));
    });

    app.post('/api/params/follower/periods', function(req,res){

        let periods = req.body.periods;
        
        Config = readConfigFile();
        Config.follower.periods=periods
        
        saveConfigFile( Config );
        res.end(JSON.stringify({success:true}))
    });

    app.post('/api/params/onboarding/finished', function(req,res){

        database.setParamsOnboarding(false);

        res.end(JSON.stringify({
            success:true
        }));
    });

    app.get('/api/flashs', function(req,res){

        let flashs = database.getLastFlashs();
        res.end(JSON.stringify(flashs.map(e=>({followers: e.n_followers, n_following:e.n_following, date: e.dt}))))
    })

    app.get('/api/data', function (req, res) {

        fs.readFile('./db/data_ohmyataya.json', 'utf8', function (err, contents) {

            res.end(contents);
        });
    });

    app.get('/api/stats/follow', function(req, res){

        let last_hours=24;
        let interval_min=10;

        let begin_dt = new Date( Date.now() - last_hours*HOURS );
        begin_dt.setMinutes( Math.floor( begin_dt.getMinutes()/interval_min)*interval_min,0,0 )
        begin_dt = begin_dt.getTime();

        let json = database.getUsers({
            followed_dt:{
                $gt:begin_dt
            }
        });

        let table = [];

        for( var i=0; i< (60/interval_min)*last_hours ; i++ ){

            table.push({
                from: begin_dt + i*interval_min*MINUTES,
                to: begin_dt + i*interval_min*MINUTES+interval_min*MINUTES,
                n_users:0
            });
        }

        json.forEach(({followed_dt}) => {

            table = table.map( interval => (
                followed_dt > interval.from && followed_dt < interval.to
            )?Object.assign({},interval,{ n_users:interval.n_users+1 }):interval

            )
        });

        res.end(JSON.stringify(
            {
                table:table.map(({from, n_users})=>({from, n_users})),
                length:json.length
            }
        ));
    });

    app.get('/api/stats', function(req,res){

        let json = database.getStats();

        res.end(JSON.stringify(json))
    })

    app.get('/api/logs', function(req,res){

        let json = database.getLogs();

        res.end(JSON.stringify(json))
    })

    app.get('/api/spy/', async (req, res) => {

        let success, message, user = null,
            users;

        try {

            users = await database.getTargets( { getRatio:true } );
            success = true;

        } catch (e) {

            message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message,
            users
        }));
    });

    app.get('/api/spy/accounts/:username', async (req, res) => {

        let {
            username
        } = req.params;
        let success, message, user = null,
            list;

        try {

            list = await database.getTargets().filter(u => (u.username == username))

            if (list.length > 0) {
                user = list[0];
                success = true;
            } else {
                success = false;
            }

        } catch (e) {

            message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message,
            user
        }));
    });

    app.get('/api/spy/hashtag/:hashtag', async (req, res) => {

        let {
            hashtag
        } = req.params;
        let success, message, user = null,
            list;

        try {

            list = await database.getTargets().filter(u => (u.hashtag == hashtag))

            if (list.length > 0) {
                user = list[0];
                success = true;
            } else {
                success = false;
            }

        } catch (e) {

            message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message,
            user
        }));
    });

    app.post('/api/spy/accounts/:username', async (req, res) => {

        let {
            username
        } = req.params;
        let success, message;

        try {
            database.addTargetAccount(username);
            success = true;
        } catch (e) {

            if (e.message.includes("Duplicate key"))
                message = "Already in database";
            else
                message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message
        }));
    });

    app.post('/api/spy/hashtags/:hashtag', async (req, res) => {

        let {
            hashtag
        } = req.params;
        let success, message;

        try {
            database.addTargetHashtag(hashtag);
            success = true;
        } catch (e) {

            if (e.message.includes("Duplicate key"))
                message = "Already in database";
            else
                message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message
        }));
    });

    app.patch('/api/spy/accounts/:username', async (req, res) => {

        let {
            username
        } = req.params;
        let success, message;

        try {
            if( req.body.enable === false)
                database.disableTargetAccount( username );

            else if( req.body.enable === true)
                database.enableTargetAccount( username );

            success = true;

        } catch (e) {

            message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message
        }));
    });

    app.patch('/api/spy/hashtags/:hashtag', async (req, res) => {

        let {
            hashtag
        } = req.params;
        let success, message;

        try {
            if( req.body.enable === false)
                database.disableTargetHashtag( hashtag );

            else if( req.body.enable === true)
                database.enableTargetHashtag( hashtag );

            success = true;

        } catch (e) {

            message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message
        }));
    });

    app.delete('/api/spy/accounts/:username', async (req, res) => {

        let {
            username
        } = req.params;
        let success, message;

        try {
            
            database.removeTargetAccount( username );
            success = true;
        } catch (e) {

            message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message
        }));
    });

    app.delete('/api/spy/hashtags/:hashtag', async (req, res) => {

        let {
            hashtag
        } = req.params;
        let success, message;

        try {
            
            database.removeTargetHashtag( hashtag );
            success = true;
        } catch (e) {

            message = "Unknown error";
            success = false;
        }

        res.end(JSON.stringify({
            success,
            message
        }));
    });

    app.get('/api/checkaccount/:username', async (req, res) => {

        let {
            username
        } = req.params;
        let success, message;

        const cheerio = require('cheerio')

        try {
            
            request(`https://www.instagram.com/${username}`, function (error, response, body) {

                const $ = cheerio.load(body);

                let exists=!$('title').text().includes('Page Not Found');

                res.end(JSON.stringify({
                    success:true,
                    exists
                }));
              });

        } catch (e) {

            res.end(JSON.stringify({
                success:false,
                exists:false,
                message:"Unknown error"
            }));
        }
    });

    server = app.listen(port, function () {

        running = true;
        logger.info(`Server ready ( port ${port} )`);

    });

    app.patch('/api/follower', async (req, res) => {

        database.setFollowerStart( req.body.start );
        res.end(JSON.stringify({success:true}));
    });

    app.patch('/api/scanner', async (req, res) => {

        database.setScannerStart( req.body.start );
        res.end(JSON.stringify({success:true}));
    });

    app.use( express.static('server_public'));

    app.use( '/data', express.static(`${getAppUserFolder()}/data`) );
}

const openBrowser = ( port=44333 ) => {
    opn('http://localhost:'+port);
}

const isRunning = async () => {

    for( var i=0; i<100; i++ ){

        if( isRunning ) return true;
        await timeout(100);
    }

    return false;
}

const stop = () => {

    if( server ){
        server.close();
    }
}

export default {
    start,
    isRunning,
    stop,
    openBrowser
}