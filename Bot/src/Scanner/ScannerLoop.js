import Database  from '../Database/Database';

import {
    ExceptionInstagramNotLoggedIn,
    ExceptionInstagramAccount404,
    ExceptionInstagramLoginFailed,
    ExceptionInstagramLoginSuspect
} from '../Instagram/Exceptions';

import { saveProfileImg } from '../lib/appdata';
import { computeScore } from '../Smart/smart';

import Constants from '../lib/constants';

const select_target = async(db) => {

    let targets = Database.get_targets_db(db);
    // TODO improve this function

    return targets.length > 0
        ? targets[0].username
        : null;
}

const scan_account = ( instagram, logger, database ) => async ({ username }) => {
    
    let followers = await instagram
        .get_user_last_reacting_users( username, 3 ); // TODO adapt n_post ? (=3)

    let new_users = database
        .addUsers(followers, username);

    logger.info( `${new_users} new users getted from ${username}` );

    database.scannedTargetAccount( username, new_users );
}

const scan_hashtag = ( instagram, logger, database ) => async ({ hashtag }) => {

    let data = await instagram.hashtag( hashtag.replace("#","") ).read();

    let posts = [];
    for( let i = 0; i< data.top.length; i++ ){

        try{
            let { postID } = data.top[i];
            // TODO TODO TODO BLOCK HERE
            posts.push( Object.assign({},await instagram.post( postID ).read( true, true ),{ postID }));
        } catch( e ){
            logger.error( e );
        }
    }

    let users = [];
    for( let i=0; i<posts.length; i++ ){

        var fs = require('fs');
        
        users = [
            ...users,
            ...posts[i].likes.map(u=>Object.assign({},u,{ liked: posts[i].postID })),
            ...posts[i].comments.map(({username, content, hashtag})=>({ username, commented:{ postID:posts[i].postID, content, hashtag } }))
        ]
    }
    
    let new_users = database.addUsers(users, hashtag);
    database.scannedTargetHashtag(hashtag, 0);
}

export const scanner_loop = (instagram, logger, Config) => async(database) => {

    let followers,
        new_users;

    try {

        let lastFlashDate = new Date(database.getLastFlashDate());
        lastFlashDate.setMinutes(0, 0, 0);
        
        // Each [Config.flash.hour_delay] hours, read self profile, update
        // followers_back and save current followers
        if ( Date.now() > lastFlashDate.getTime() + (Config.flash.hour_delay * 1000 * 60 * 60)) {

            logger.info(`Flashing profile ${Config.accounts.main.login}`);

            let {
                followers,
                followings,
                n_followers,
                n_following,
                posts,
                n_posts,
                profile_img_uri }
                = await instagram.profile(Config.accounts.main.login).read( true );

            // Save Profile Image on computer.
            saveProfileImg( profile_img_uri, Config.accounts.main.login );

            database.addFlash({n_followers,n_following});
            database.updateFollowBackUsers(followers.map(e => e.username));
            if( followings )
                database.updateAlreadyFollowedUsers( followings );

            return;
        }

        let targets = database.getTargets({last_scan_day: 1, enable: true});

        if ( targets.length === 0) {

            // The scanner doesn't scan targets often. So when he has no target to scan, it will analyse pages
            let user = database.findUserToAnalyse();
            //TODO slow down scan to avoid account ban
            // but have to be faster than follower.

            if( !user ) return ;

            try{

                let analysis = await instagram.profile( user.username ).read(false);

                let score = computeScore( Object.assign({},user, analysis) );

                if( score > 0 )
                    database.userAnalyzed( user.username, analysis, score );
                else
                    database.ignoredUser( user.username );


                let n_users_analyzed = database.getUsers({ state: Constants.ANALIZED });

                if( n_users_analyzed > 200 ){

                    logger.info( `50 Analyzed users purged` );
                    database.purgeAnalyzedUsers( 50 );
                }

                if( score > 0 )
                    logger.info(`Account ${user.username} analyzed`);
                else
                    logger.info(`Account ${user.username} analyzed and ignored`);

            } catch ( e ){

                if( e instanceof ExceptionInstagramAccount404) {
                    
                    logger.warn(`User ${user.username} doesn't exists.`);
                    database.removeUser( user.username );
                } else {

                    logger.error( e )
                }
            }

            return;
        }

        let topTarget = targets[0];
        if( topTarget.username ){

            await scan_account( instagram, logger, database )( topTarget );

        } else if( topTarget.hashtag ){

            await scan_hashtag( instagram, logger, database )( topTarget );

        } else {

            logger.error( "Unknown target type" );
            logger.error( topTarget );
        }

    } catch (e) {
        if (e instanceof ExceptionInstagramNotLoggedIn) {
            throw new ExceptionInstagramNotLoggedIn();
        } else {
            logger.error(e)
        }
    }
}
