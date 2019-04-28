import {
    follow_loop
} from './follow';
import {
    unfollow_loop,
    count_users_to_unfollow
} from './unfollow';
import {
    timeout,
    randomize,
    ExceptionBadKey
} from '../lib/misc';
import {
    smartwait,
    beautifulDelay,
    smartwaiting,
    SECONDS,
    MINUTES,
    HOURS,
    DAYS
} from '../lib/smartwait';

import {
    ExceptionInstagramNotLoggedIn,
    ExceptionFollowBlocked,
    ExceptionUnfollowBlocked,
    ExceptionInstagramLoginFailed,
    ExceptionInstagramLoginSuspect
} from '../Instagram/Exceptions';

import Instagram from '../Instagram/Instagram';
import { readConfigFile } from '../lib/misc'
import { checkKey } from '../lib/protection';

var Config = readConfigFile();

// Wait user to update password or max 12h
const wait_next_login_attempt = async ( database, logger ) => {

    let dt = database.getMainAccountLoginErrorDt();

    let interval = 2000;
    let max_loop = 12*HOURS; // if no update from user after 12 hours, try again.
    let i=0;

    logger.warn('Waiting user to change password.');

    while( i < max_loop / interval ){
        if( !database.getMainAccountLoginError()) return;
        await timeout(2000);
        i++;
    }
}

// If follow id blocked, we check date to retry
const followIsBlocked = (database,logger) => {

    let state = database.getBlockingState();

    if( state.follow.blocked===false ) return false;

    let unblock_dt = state.follow.history[0] + 24*60*60*1000;
    let delay = unblock_dt - Date.now();

    if( delay<=0) {

        database.setFollowBlockingState(false);
        // Try if always blocked
    }

    //logger.warn( `Follow is blocked for the moment, try again in ${beautifulDelay(delay)}.` );

    return ( delay > 0 );
}


// If follow id blocked, we check date to retry
const unfollowIsBlocked = (database,logger) => {

    let state = database.getBlockingState();

    if( state.unfollow.blocked==false ) return false;

    let unblock_dt = state.unfollow.history[0] + 24*60*60*1000;
    let delay = unblock_dt - Date.now();

    if( delay<=0) {

        database.setUnfollowBlockingState(false);
        // Try if always blocked
    }

    //logger.warn( `Unfollow is blocked for the moment, try again in ${beautifulDelay(delay)}.` );

    return ( delay > 0 );
}

const follow_limit_reach = ( database ) => {

    Config = readConfigFile();

    let recent_account = Config.accounts.main.creation_dt + 20*DAYS > Date.now();

    let hour_follow_limit = recent_account?100:200;
    let day_follow_limit = recent_account?500:1000;

    return ( 
        database.numUserFollowedSince( 1 ) > hour_follow_limit ||
        database.numUserFollowedSince( 24 ) > day_follow_limit
    );
}

const unfollow_limit_reach = ( database ) => {

    Config = readConfigFile();

    let recent_account = Config.accounts.main.creation_dt + 20*DAYS > Date.now();

    let hour_follow_limit = recent_account?100:200;
    let day_follow_limit = recent_account?500:1000;

    return ( 
        database.numUserUnfollowedSince( 1 ) > hour_follow_limit ||
        database.numUserUnfollowedSince( 24 ) > day_follow_limit
    );
}

//
const follower_loop = async( database, instagram, logger ) => {

    let n_users_to_follow = database.getNumUserToFollow();
    let n_users_to_unfollow = database.getNumUserToUnfollow();

    let lastFlashFollowing = parseInt( database.getLastFlash().n_following, 10);

    //logger.info(database.getLastFlash());

    let can_follow =
        !follow_limit_reach( database )
        && n_users_to_follow>0
        && !followIsBlocked( database, logger )
        && lastFlashFollowing < 2500;
    
    if( lastFlashFollowing > 2500 ){
        logger.warn(`Too much following on your account.`);
        logger.warn(`Can't follow ( your have ${ lastFlashFollowing }, max is 2500 )`);
    };

    // logger.info('follow_limit_reach', follow_limit_reach( database ))
    // logger.info('n_users_to_follow', n_users_to_follow)
    // logger.info('followIsBlocked', followIsBlocked( database, logger ))
    // logger.info('n_following', parseInt( database.getLastFlash().n_following, 10))

    let can_unfollow =
        n_users_to_unfollow>0 &&
        !unfollowIsBlocked( database, logger );

    if( !can_follow && !can_unfollow ) {
        // Nothing to do
        logger.warn("Nothing to do.");
        return ;
    }

    // If can only unfollow
    if( !can_follow ){ 

        await unfollow_loop( instagram, database, logger );
    }
    // If can only follow
    else if( !can_unfollow ){ 

        await follow_loop( instagram, database, logger );
    }
    // Can do both : follow of unfollow. So we random it.
    else {

        let rand = Math.random();

        if( rand > ( lastFlashFollowing / 2500 ) )
            await follow_loop( instagram, database, logger )
        else
            await unfollow_loop( instagram, database, logger );
    }
}

const start = async ( database, logger, show=false ) => {

    let instagram = new Instagram({show});
    let suspect=false;

    instagram.setLogger( logger );
    
    while(true){

        try{

            // TODO await loginTryAgain if error

            Config = readConfigFile();
            
            let account = Config.accounts.main;
            if( suspect )
                await instagram.session().loginSuspect( Config.accounts.main );
            else
                await instagram.session().login( account );
            database.setMainAccountLoginError( false );

            while( true ){

                let { started } = database.getParams().follower;

                if( !started ){

                    await timeout( 5*SECONDS );
                } else {

                    await smartwaiting( logger );

                    try{

                        Config = readConfigFile();
                        if(!checkKey(Config.key)) throw new ExceptionBadKey(Config.key);
                        database.setKeyError(false)
                        await follower_loop( database, instagram, logger );

                    } catch (e){

                        if( e instanceof ExceptionInstagramNotLoggedIn ){

                            throw e; // Transfer to relogin loop.
                        } else if( e instanceof ExceptionFollowBlocked )  {

                            logger.warn('Follow blocked');
                            database.setFollowBlockingState(true);

                        } else if( e instanceof ExceptionUnfollowBlocked ) {

                            logger.warn('Unfollow blocked');
                            database.setUnfollowBlockingState(true);

                        } else if( e instanceof ExceptionBadKey ) {

                            database.setKeyError(true);

                        } else {
                            logger.error( e );
                        }
                    }

                }
            }
        } catch (e){
            if( e instanceof ExceptionInstagramLoginFailed ) {
                        
                logger.error("Loggin failed");
                database.setMainAccountLoginError( true );
                await wait_next_login_attempt( database, logger );

            } else if( e instanceof ExceptionInstagramLoginSuspect ){

                logger.error("Account suspect");
                database.setSuspectAccount( true );
                suspect=true;

            } else logger.error( e )
        }

        // Login problem
        await(timeout(5000));
    }
    return;
}

export default {
    start
};
