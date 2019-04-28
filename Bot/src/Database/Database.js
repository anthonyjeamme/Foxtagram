import Loki from 'lokijs';
import {timeout, getAppUserFolder, readConfigFile} from '../lib/misc';

var mkdirp = require('mkdirp');

var Config = readConfigFile();

import Constants from '../../src/lib/constants'
import { DAYS } from '../lib/smartwait';

import { logFollow, logUnfollow, getLogs, logAskedFollow } from './func/log';

export function ExceptionUnknownTarget(username) {
    this.message = `${username} target doesn't exists.`;
};

export function ExceptionUnknownUser(username) {
    this.message = `${username} user doesn't exists.`;
};

export function ExceptionUserListEmpty() {
    this.message = `User List Empty`;
};

export function ExceptionBadUserAnalysisData(username, data) {
    this.message = `Bad analysis Data for ${username} (data=${JSON.stringify(data)})`;
};

export function ExceptionAskedFollowNotAnalyzedUser(username) {
    this.message = `Ask Follow not analyzed user ${username}`;
};

export function ExceptionFollowedNotAnalyzedUser(username) {
    this.message = `Followed not analyzed user ${username}`;
};

export default class Database {

    constructor(params = {}) {

        // Default params
        this.params = Object.assign({
            users: true,
            targets: true,
            id: "default"
        }, params);

        this.ready = false;

        // Create folder to stock files (images for ex.)
        mkdirp(`${getAppUserFolder()}/db/${this.params.id}`);

        mkdirp(`${getAppUserFolder()}/db/${this.params.id}/profile_images`); // TODO remove ?

        mkdirp(`${getAppUserFolder()}/data/profile_images`);

        let db_file_path = params.db_file_path?params.db_file_path:`${getAppUserFolder()}/db/data_${this.params.id}.json`;

        // Load Database (create if doesn't exists).
        this.db = new Loki(db_file_path, {
            autoload: true,
            autoloadCallback: () => {

                var params = this
                    .db
                    .getCollection("params");
                if (!params) {
                    params = this
                        .db
                        .addCollection("params");
                    params.insert({
                        onboarding:true,
                        instagram:{
                            blocking:{
                                login:{
                                    main:{
                                        error:false
                                    },
                                    others:[]
                                }, 
                                follow:{
                                    history:[],
                                    blocked:false
                                },
                                unfollow:{
                                    history:[],
                                    blocked:false
                                }
                            }
                        },
                        server: {},
                        scanner: {
                            started: false
                        },
                        follower: {
                            started: false
                        }
                    })
                }

                var logs = this
                    .db
                    .getCollection("logs");
                if (!logs) {
                    logs = this
                        .db
                        .addCollection("logs");
                }

                var flash = this
                    .db
                    .getCollection("flash");
                if (!flash) {
                    flash = this
                        .db
                        .addCollection("flash");
                }

                if (this.params.users) {
                    // Users we want to follow.
                    var users = this
                        .db
                        .getCollection("users");
                    if (!users) 
                        users = this.db.addCollection("users", {unique: ['username']});
                    }
                
                if (this.params.targets) {
                    // Users we want to stole followers.
                    var targets = this
                        .db
                        .getCollection("targets");
                    if (!targets) 
                        targets = this.db.addCollection("targets", {unique: ['username','hashtag']});
                    }
                
                this.ready = true;
            },
            autosave: true,
            autosaveInterval: 2000
        });
    }

    setKeyError( error ){

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        params.keyError = error;
        params_collection.update(params);
    }

    setSuspectAccount( suspect ){
        
        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        params.instagram.blocking.login.main.suspect = suspect;

        params_collection.update(params);
    }

    setMainAccountLoginError( error ){

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        params.instagram.blocking.login.main.error = error;

        if( error )
            params.instagram.blocking.login.main.dt = Date.now();
        params_collection.update(params);
    }

    getMainAccountLoginError(){ // TODO userless => remove

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        return params.instagram.blocking.login.main.error;
    }

    getOtherAccountLoginError( accountIndice=0 ){ // TODO userless => remove

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        return params.instagram.blocking.login.others[accountIndice].error;
    }

    getMainAccountLoginErrorDt(){

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        return params.instagram.blocking.login.main.dt;
    }

    setOtherAccountLoginError( account, error ){

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        let other = params.instagram.blocking.login.others.filter((e)=>e.account == account);

        if( other.length==0 ){
            params.instagram.blocking.login.others.push(Object.assign({
                account,error
            }),error?{dt: Date.now()}:{});
        } else {
            params.instagram.blocking.login.others = params.instagram.blocking.login.others.map(e=>{

                if( e.account==account ){
                    return Object.assign({},e,{error}, error?{dt:Date.now()}:{} )
                } else return e;
            })
        }

        params_collection.update(params);
    }

    getBlockingState(){

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        return Object.assign({},params.instagram.blocking)
    }

    // Update Blocking state
    setFollowBlockingState( blocked ){

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        params.instagram.blocking.follow.blocked = blocked;
        if( blocked )
            params.instagram.blocking.follow.history.unshift( Date.now() );

        params_collection.update(params);
    }
    
    setUnfollowBlockingState( blocked ){

        let params_collection = this
            .db
            .getCollection("params");

        let params = params_collection.findOne({});

        params.instagram.blocking.unfollow.blocked = blocked;
        if( blocked )
            params.instagram.blocking.unfollow.history.unshift( Date.now() );

        params_collection.update(params);
    }

    /*
     * Database loading can take time.
     */
    async isReady() {

        if (this.db === null) 
            throw "Database not initialized";
        while (!this.ready) {
            await timeout(100);
        }
    }

    // TODO unit test
    close() {
        return new Promise((resolve) => {

            if (this.db != null) {
                this
                    .db
                    .close(resolve);
                this.db = null;
            } else {
                resolve();
            }
        })
    }

    // TODO unit test
    getLastFlashDate() {

        let flash_collection = this
            .db
            .getCollection("flash");

        let lastFlash = flash_collection
            .chain()
            .simplesort('dt', true)
            .limit(1)
            .data();

        if (lastFlash.length === 0) 
            return 0;
        
        return lastFlash[0].dt;
    }

    // TODO unit test
    getLastFlashs(hours = 48) {

        let flash_collection = this
            .db
            .getCollection("flash");

        return flash_collection.find({
            dt: {
                $gt: Date.now() - (hours * 60 * 60 * 1000)
            }
        })
    }

    getLastFlash() {

        let flash_collection = this
            .db
            .getCollection("flash");

        return flash_collection.chain().find({}).simplesort('dt', true).limit(1).data()[0];
    }

    // TODO unit test
    addFlash(flash) {

        let flash_collection = this
            .db
            .getCollection("flash");

        let res = flash_collection.insert(Object.assign({}, {
            dt: Date.now()
        }, flash));

        return res;
    }

    // Purge old flashs ( we keep just 1 flash per day or week ).
    // TODO unit test
    purgeFlash(){
        
    }

    // TODO unit test
    getParams() {

        let params_collection = this
            .db
            .getCollection("params");
        return params_collection.findOne({});
    }

    // TODO unit test
    setParamsOnboarding( onboarding ) {

        let params_collection = this
            .db
            .getCollection("params");
        let p = params_collection.findOne({});;

        p.onboarding = onboarding;
        p.scanner.started = true;
        p.follower.started = true;

        params_collection.update(p);
    }

    isOnBoarding() {
        
        let params_collection = this
            .db
            .getCollection("params");
        let p = params_collection.findOne({});;

        return p.onboarding;
    }

    // TODO unit test
    setFollowerStart(start) {

        let params_collection = this
            .db
            .getCollection("params");
        let p = params_collection.findOne({});;

        p.follower.started = start;
        params_collection.update(p);
    }

    // TODO unit test
    setScannerStart(start) {

        let params_collection = this
            .db
            .getCollection("params");
        let p = params_collection.findOne({});;

        p.scanner.started = start;
        params_collection.update(p);
    }

    // TODO remove that
    addTarget(username, userData = {}) {

        let targets_collection = this
            .db
            .getCollection("targets");
        return targets_collection.insert(Object.assign({}, {
            username,
            last_scan_datetime: 0,
            last_scan_new_entries: 0,
            enable: true,
            follow_count:0, // Num of follow done on users who react on this page.
            extract_count:0, // Num of extractions done on users who react on this page.
            score: 1
        }, userData));
    }

    addTargetAccount( username, userData = {} ) {

        let targets_collection = this
            .db
            .getCollection("targets");
        return targets_collection.insert(Object.assign({}, {
            username,
            last_scan_datetime: 0,
            last_scan_new_entries: 0,
            enable: true,
            follow_count:0, // Num of follow done on users who react on this page.
            extract_count:0, // Num of extractions done on users who react on this page.
            score: 1
        }, userData));
    }
    
    addTargetHashtag( hashtag ) {
        
        let targets_collection = this
            .db
            .getCollection("targets");
        return targets_collection.insert({
            hashtag,
            last_scan_datetime: 0,
            last_scan_new_entries: 0,
            enable: true,
            follow_count:0, // Num of follow done on users who react on this page.
            extract_count:0, // Num of extractions done on users who react on this page.
            score: 1
        });
    }

    // TODO unit test
    getTargetRatio(target) {

        let user_collection = this
            .db
            .getCollection("users");

        let data = user_collection
            .chain()
            .where(u => u.sources.includes(target) && u.unfollowed_dt)
            .data();

        data = user_collection
            .find({
            followed_dt: {
                "$between": [1, Date.now()-2*DAYS ]
            }
        })
        .filter(e => e.sources.includes(target))

        let following = data.length;
        let follow_back = data
            .filter(e => e.follow_back == true)
            .length;

        let ratio = following === 0
            ? 0
            : follow_back / following;

        return {following, follow_back, ratio}
    }

    // TODO unit test
    getTargets(params = {}) {

        let targets_collection = this
            .db
            .getCollection("targets");

        let findCondition = {};

        if (params.last_scan_day) {
            let oneDay = params.last_scan_day * 24 * 60 * 60 * 1000; // Smarter method => if active page, scan more often ?
            let date_min = new Date();
            date_min.setTime(date_min.getTime() - oneDay);

            findCondition = {
                last_scan_datetime: {
                    '$lt': date_min.getTime()
                }
            };
        }

        if (params.enable) {
            findCondition.enable = params.enable;
        }

        if (params.getRatio) {

            return targets_collection
                .find(findCondition)
                .map(({
                    username,
                    hashtag,
                    last_scan_datetime,
                    last_scan_new_entries,
                    score,
                    enable,
                    extract_count,
                    follow_count
                }) => (Object.assign({
                    username,
                    hashtag,
                    last_scan_datetime,
                    last_scan_new_entries,
                    score,
                    enable,
                    extract_count,
                    follow_count
                }, this.getTargetRatio(username))));
        }

        return targets_collection
            .find(findCondition)
            .map(({
                username,
                hashtag,
                last_scan_datetime,
                last_scan_new_entries,
                score,
                enable,
                extract_count
            }) => ({
                username,
                hashtag,
                last_scan_datetime,
                last_scan_new_entries,
                score,
                enable,
                extract_count
            }));
    }

    scannedTargetAccount(username, new_entries) {

        let targets_collection = this
            .db
            .getCollection("targets");
        let target = targets_collection.findOne({username});

        if (target == null) {
            throw new ExceptionUnknownTarget(username);
        }

        target.last_scan_datetime = Date.now();
        target.last_scan_new_entries = new_entries;

        targets_collection.update(target);
    }

    scannedTargetHashtag(hashtag, new_entries) {

        let targets_collection = this
            .db
            .getCollection("targets");
        let target = targets_collection.findOne({ hashtag });

        if (target == null) {
            throw new ExceptionUnknownTarget( hashtag );
        }

        target.last_scan_datetime = Date.now();
        target.last_scan_new_entries = new_entries;

        targets_collection.update(target);
    }

    removeTargetAccount(username) {

        let targets_collection = this
            .db
            .getCollection("targets");
        targets_collection.findAndRemove({username});
    }

    removeTargetHashtag(hashtag) {

        let targets_collection = this
            .db
            .getCollection("targets");
        targets_collection.findAndRemove({hashtag});
    }

    enableTargetAccount(username) {

        let targets_collection = this
            .db
            .getCollection("targets");
        let target = targets_collection.findOne({username});

        if (target == null) {
            throw new ExceptionUnknownTarget(username);
        }

        target.enable = true;

        targets_collection.update(target);
    }
    enableTargetHashtag( hashtag ) {

        let targets_collection = this
            .db
            .getCollection("targets");
        let target = targets_collection.findOne({hashtag});

        if (target == null) {
            throw new ExceptionUnknownTarget(hashtag);
        }

        target.enable = true;

        targets_collection.update(target);
    }

    disableTargetAccount( username ) {

        let targets_collection = this
            .db
            .getCollection("targets");
        let target = targets_collection.findOne( {username} );

        if (target == null) {
            throw new ExceptionUnknownTarget( username );
        }

        target.enable = false;
        targets_collection.update(target);
    }
    
    disableTargetHashtag( hashtag ) {

        let targets_collection = this
            .db
            .getCollection("targets");
        let target = targets_collection.findOne( {hashtag} );

        if (target == null) {
            throw new ExceptionUnknownTarget( hashtag );
        }

        target.enable = false;
        targets_collection.update( target );
    }

    // Add +1 to counter.
    newTargetAccountEntries(username, count) {

        try {

            let targets_collection = this
                .db
                .getCollection("targets");
            let target = targets_collection.findOne({username});

            if (target === null) 
                throw new ExceptionUnknownTarget(username)

            if (!target.extract_count) 
                target.extract_count = 0;
            target.extract_count += count;

            targets_collection.update(target);

        } catch (e) {

            if (e instanceof ExceptionUnknownTarget) {
                throw e;
            } else {
                console.error(e); // No logger here.. What to do ?
            }
        }
    }
    newTargetHashtagEntries(hashtag, count) {

        try {

            let targets_collection = this
                .db
                .getCollection("targets");
            let target = targets_collection.findOne({hashtag});

            if (target === null) 
                throw new ExceptionUnknownTarget(hashtag)

            if (!target.extract_count) 
                target.extract_count = 0;
            target.extract_count += count;

            targets_collection.update(target);

        } catch (e) {

            if (e instanceof ExceptionUnknownTarget) {
                throw e;
            } else {
                console.error(e); // No logger here.. What to do ?
            }
        }
    }

    removeTarget(name) {
        let targets_collection = this
            .db
            .getCollection("targets");

        if( name[0]==="#" ){
            targets_collection.findAndRemove({hashtag:name});
        }
        else {
            targets_collection.findAndRemove({username:name});
        }
    }

    // TODO unit test
    newTargetFollow( username ){
        let targets_collection = this
            .db
            .getCollection("targets");
        let target = targets_collection.findOne({username});

        if( !target.follow_count ) target.follow_count=0;
        target.follow_count++;

        targets_collection.update(target);
    }

    addUsers(userList, source) {

        let user_collection = this
            .db
            .getCollection("users");
        let newEntries = 0;

        userList.forEach(user => {

            try {

                let liked = user.liked
                    ? [user.liked]
                    : [];
                let commented = user.commented
                    ? [user.commented]
                    : [];

                // TODO take in consideration commented & liked fields
                // TODO add a state "ANALYSED" or a analyse field.
                user_collection.insert(Object.assign({}, {
                    follow_back: false,
                    sources: [source],
                    score: null,
                    state: Constants.INIT
                }, user, {liked, commented}));

                newEntries++;

            } catch (e) {

                let entry = user_collection.findOne({username: user.username})

                if (user.liked && !entry.liked.includes(user.liked)) 
                    entry.liked = [
                        ...entry.liked,
                        user.liked
                    ];
                if (user.commented) {
                    if (entry.commented.filter(e => e.id === user.commented.id).length === 0) 
                        entry.commented = [
                            ...entry.commented,
                            user.commented
                        ];
                    }
                
                if (!entry.sources.includes(source)) {
                    entry
                        .sources
                        .push(source);
                }
                user_collection.update(entry)
            }
        });

        // +newEntries to target counter.
        source[0]==="#"?
            this.newTargetHashtagEntries(source, newEntries):
            this.newTargetAccountEntries(source, newEntries);

        return newEntries;
    }

    updateAlreadyFollowedUsers( followings ){
        
        let user_collection = this
        .db
        .getCollection("users");
        
        followings.forEach( ({ username, followed_by_viewer, requested_by_viewer, profile_pic_url }) => {
            
            let user = user_collection.findOne({username});

            if( user ){

                if( user.state == Constants.ASK_FOLLOW || user.state == Constants.FOLLOWED ) return

                user.legacy=true;
                user.block_unfollow=true;
                user.state = requested_by_viewer?Constants.ASK_FOLLOW:Constants.FOLLOWED;
                user_collection.update(user);

                return;
            }

            user_collection.insert(Object.assign({}, {
                username,
                follow_back: followed_by_viewer,
                sources: [],
                legacy: true,
                score: null,
                state: requested_by_viewer?Constants.ASK_FOLLOW:Constants.FOLLOWED,
                block_unfollow: true,
                liked:[],
                commented:[],
                analysis_dt:0,
                followed_dt: 100,
                profile_pic_url
            } ));
        });
    }

    getUsers(filter) {

        let user_collection = this
            .db
            .getCollection("users");

        return user_collection.find(filter);
    }

    getNumUserToFollow(){

        let user_collection = this
            .db
            .getCollection("users");
        return user_collection.find({state: Constants.ANALIZED}).length;
    }

    getNumUserToUnfollow(){

        return this.getUsersFollowedBefore(Config.unfollow.delay_hours).length;
    }

    getUsersFollowedBefore(hours) {

        let user_collection = this
            .db
            .getCollection("users");

        let date_min = new Date();
        date_min.setTime(date_min.getTime() - hours * 60 * 60 * 1000);

        return user_collection.find({

            followed_dt: {
                $lt: date_min.getTime()
            },
            $or: [
                {
                    'state': Constants.FOLLOWED
                }, {
                    'state': Constants.ASK_FOLLOW
                }
            ]
        });
    }

    numUserFollowedSince( hours ){
        
        let user_collection = this
            .db
            .getCollection("users");

        let date_min = new Date();
        date_min.setTime(date_min.getTime() - hours * 60 * 60 * 1000);

        return user_collection.find({

            followed_dt: {
                $gt: date_min.getTime()
            },
            $or: [
                {
                    'state': Constants.FOLLOWED
                }, {
                    'state': Constants.ASK_FOLLOW
                }
            ]
        }).length;
    }

    numUserUnfollowedSince( hours ){
        
        let user_collection = this
            .db
            .getCollection("users");

        let date_min = new Date();
        date_min.setTime(date_min.getTime() - hours * 60 * 60 * 1000);

        return user_collection.find({

            unfollowed_dt: {
                $gt: date_min.getTime()
            },
            'state': Constants.UNFOLLOWED
        }).length;
    }

    // Remove older Init Users
    purgeInitUsers( logger, n_user_to_purge = 200 ){

        logger.info(`Purge of ${n_user_to_purge} INIT Users.`);

        let user_collection = this
            .db
            .getCollection("users");
            
        user_collection
            .chain()
            .find({state: Constants.INIT})
            .simplesort('$loki')
            .limit(n_user_to_purge)
            .remove();
    }

    // Find user with Constants.INIT state.
    findUserToAnalyse(username) {

        let user_collection = this
            .db
            .getCollection("users");
        let user = user_collection.findOne({state: Constants.INIT});
        return user;
    }

    purgeAnalyzedUsers( n=5 ) {

        let user_collection = this
            .db
            .getCollection("users");
        
        let users = user_collection
            .find({ state: Constants.ANALIZED })
            .sort( (a,b)=>(a.score>b.score)?1:(a.score<b.score)?-1:0 )

        users.slice(0,n).forEach( u=>{

            user_collection.remove( u )
        });
    }

    userAnalyzed(username, analysis, score, state = Constants.ANALIZED) {

        // n_followers
        // n_following
        
        let user_collection = this
            .db
            .getCollection("users");
        let user = user_collection.findOne({username});

        if (analysis.n_followers == null || analysis.n_following == null || analysis.n_posts == null) {
            throw new ExceptionBadUserAnalysisData(user.username, analysis);
        }

        Object.assign(user, { 
            followers: analysis.n_followers,
            following: analysis.n_following,
            posts: analysis.n_posts,
         });
        
        user.analysis_dt = Date.now();
        if (score!=null) 
            user.score = score;
        if (state) 
            user.state = state; // default = Constants.ANALIZED;
        
        user_collection.update(user);
    }

    repareScoresNull(){
        
        let user_collection = this
            .db
            .getCollection("users");
        let users = user_collection.find({ state:Constants.ANALIZED, score:null });

        users.forEach(u=>{

            u.score=0
            u.state=Constants.IGNORED;
            user_collection.update(u);

        })

    }


    getUserState(username) {

        let user_collection = this
            .db
            .getCollection("users");
        let user = user_collection.findOne({username});

        return user
            ? user.state
            : Constants.UNKNOWN;
    }

    askedFollowUser(username) {

        let user_collection = this
            .db
            .getCollection("users");
        let user = user_collection.findOne({username});

        if (!user) {
            throw new ExceptionUnknownUser(username);
        }
        if (user.state != Constants.ANALIZED) {
            throw new ExceptionAskedFollowNotAnalyzedUser(username);
        }

        user.state = Constants.ASK_FOLLOW;
        user.followed_dt = Date.now();
        user.private_account = true;

        user_collection.update(user);
        this.logAskedFollow( username );
    }

    followedUser( username ) {

        let user_collection = this
            .db
            .getCollection("users");
        let user = user_collection.findOne({username});

        if (!user) {
            throw new ExceptionUnknownUser(username);
        }
        if (user.state != Constants.ANALIZED) {
            throw new ExceptionFollowedNotAnalyzedUser(username);
        }

        user.state = Constants.FOLLOWED;
        user.followed_dt = Date.now();

        user_collection.update(user);

        user.sources.forEach( target => {
            this.newTargetFollow( target );
        });

        this.logFollow( username );
    }

    unfollowedUser( username ) {

        let user_collection = this
            .db
            .getCollection("users");
        let user = user_collection.findOne({username});

        if (!user) {
            throw new ExceptionUnknownUser(username);
        }

        user.state = Constants.UNFOLLOWED;
        user.unfollowed_dt = Date.now();

        user_collection.update(user);
        this.logUnfollow( username );
    }

    ignoredUser(username) {

        let user_collection = this
            .db
            .getCollection("users");
        let user = user_collection.findOne({username});

        if (!user) {
            throw new ExceptionUnknownUser(username);
        }

        user.state = Constants.IGNORED;
        user_collection.update(user);
    }

    findBestAnalyzedUser(sortFunc = (a, b) => (a.score < b.score)) {

        let user_collection = this
            .db
            .getCollection("users");

        let findCondition = {
            state: Constants.ANALIZED,
            score: {
                $gt: 0
            }
        };

        let userList = user_collection.find(findCondition);

        if (userList.length === 0) {
            throw new ExceptionUserListEmpty();
        }

        let user = userList.sort(sortFunc)[0];

        return user;
    }

    // The followers param should be a list of username.
    updateFollowBackUsers(followers) {

        let user_collection = this
            .db
            .getCollection("users");

        followers.forEach(username => {

            try {
                let user = user_collection.findOne({username});

                if (!user) 
                    throw new ExceptionUnknownUser(username);
                
                if (user.follow_back != true) {

                    user.follow_back = true;
                    user.follow_back_dt = Date.now();
                    user_collection.update(user);
                }

            } catch (e) {
                if (e instanceof ExceptionUnknownUser) {} else {
                    throw e;
                }
            }
        });
    }

    removeUsers() {

        let user_collection = this.db
            .getCollection("users");
        user_collection.findAndRemove({});
    }

    removeTargets() {

        let user_collection = this.db
            .getCollection("targets");
        user_collection.findAndRemove({});
    }


    unBlockLastLegacyUsers( keep=100 ){

        let user_collection = this.db
            .getCollection("users");

        let users = user_collection.find({
            block_unfollow:true,
            legacy: true
        });

        if( users.length < keep ) return;
       
        users.slice( 0, users.length-keep ).forEach( u=>{

            u.block_unfollow = false;
            user_collection.update( u );
        });
    }

    removeUser( username ) {

        if( !username ) return;

        let user_collection = this.db
            .getCollection("users");

        user_collection.findAndRemove({ username });
    }

    logFollow( username ){
        logFollow( this.db )( username );
    }

    logAskedFollow( username ){
        logAskedFollow( this.db )( username );
    }

    logUnfollow( username ){
        logUnfollow( this.db )( username );
    }

    getLogs(){
        return getLogs( this.db )();
    }

    getStats() {

        let user_collection = this.db
            .getCollection("users");

        let targets_collection = this.db
            .getCollection("targets");

        let flash_collection = this
            .db
            .getCollection("flash");

        let today = new Date();
        today.setHours(0, 0, 0, 0);

        let analyzed_count = user_collection
            .find({ state: Constants.ANALIZED })
            .length;

        let init_count = user_collection
            .find({state: Constants.INIT})
            .length;
            
        let total_followed = user_collection
            .find({ followed_dt: { "$gt": 0 } })
            .length;

        let total_legacy_blocked_followings = user_collection
            .find({ legacy: true, block_unfollow: true })
            .length;

        let followed_today = user_collection
            .find({ state: Constants.FOLLOWED, followed_dt: { "$gt": today } })
            .length;

        let total_unfollowed = user_collection
            .find({ unfollowed_dt: { "$gt": 0 } })
            .length;

        let total_analysed = user_collection
            .find({ state: Constants.ANALIZED })
            .length;

        let unfollowed_today = user_collection
            .find({ state: Constants.UNFOLLOWED, unfollowed_dt: { "$gt": today } })
            .length;

        let total_ask_followed = user_collection
            .find({ state: Constants.ASK_FOLLOW })
            .length;

        let ask_followed_today = user_collection
            .find({ state: Constants.ASK_FOLLOW, followed_dt: { "$gt": today } })
            .length;

        let nb_targets = targets_collection
            .find({})
            .length;

        let nb_users = user_collection
            .find({})
            .length;

        let lastFlash = flash_collection
            .chain()
            .simplesort('dt', true)
            .limit(1)
            .data();

        let n_followers = lastFlash.length === 0 ? 0 : lastFlash[0].n_followers;
        let n_followings= lastFlash.length === 0 ? 0 : lastFlash[0].n_following;

        let todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
        todayMidnight = todayMidnight.getTime();

        let dayFlashs = flash_collection.chain().find({
            dt : {$gt: todayMidnight}
        }).simplesort('dt', false).data()

        let n_new_followers = dayFlashs.length>0?( n_followers - dayFlashs[0].n_followers):0;

        return {
            total_followed,
            followed_today,
            analyzed_count,
            total_legacy_blocked_followings,
            init_count,
            total_analysed,
            total_unfollowed,
            unfollowed_today,
            total_ask_followed,
            ask_followed_today,
            nb_targets,
            nb_users,
            n_followers,
            n_followings,
            n_new_followers
        }
    }
}