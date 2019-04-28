import Constants from '../lib/constants';

import {
    ExceptionInstagramNoInternet,
    ExceptionInstagramAccount404,
    ExceptionInstagramNotLoggedIn,
    ExceptionInstagramAlreadyFollowed,
    ExceptionInstagramAlreadyAskFollow,
    ExceptionFollowBlocked,
    ExceptionUnfollowBlocked
}  from '../Instagram/Exceptions';

import { ExceptionUserListEmpty } from '../Database/Database';

export function ExceptionNoUserToFollow() {
    this.message = "No User Found in Database to Follow.";
    this.name = "ExceptionNoUserToFollow"
}

export function ExceptionInstagramLimitation() {
    this.message = "Instagram Limitation Reached";
    this.name = "ExceptionInstagramLimitation"
}

// Follow an interesting user (good prob to follow back).
export const follow_loop = async (instagram, database, logger) => {

    let state, user;

    try {

        // Find good user
        user = database.findBestAnalyzedUser();

        if (!user) {
            throw new ExceptionNoUserToFollow();
        }

        // Follow him
        state = await instagram.profile(user.username).follow()

        if( state === Constants.ASK_FOLLOW )
            database.askedFollowUser( user.username );
        else 
            database.followedUser( user.username );

    } catch (e) {

        if( e instanceof ExceptionInstagramAccount404 ){

            logger.warn(`User ${user.username} doesn't exists.`);
            database.removeUser( user.username );
        }
        else if( e instanceof ExceptionInstagramNotLoggedIn ){

            throw new ExceptionInstagramNotLoggedIn();
        } else if( e instanceof ExceptionUnfollowBlocked || e instanceof ExceptionFollowBlocked ){
            throw e;
        }
        else if( e instanceof ExceptionInstagramAlreadyFollowed ){

            database.followedUser( user.username );
            logger.warn(`User ${user.username} already followed.`);
        }
        else if( e instanceof ExceptionInstagramAlreadyAskFollow ){

            database.askedFollowUser( user.username );
            logger.warn(`User ${user.username} already asked to follow.`);
            
        } else if (e instanceof ExceptionUserListEmpty){
            logger.warn('Waiting for user to follow');
        }
        else{
            logger.error(e);
        }
    }
}