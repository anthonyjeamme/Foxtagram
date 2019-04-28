import { readConfigFile } from '../lib/misc'
var Config = readConfigFile();

import {
    ExceptionInstagramAccount404,
    ExceptionInstagramNotLoggedIn,
    ExceptionInstagramNotFollowed
} from '../Instagram/Exceptions';

export const count_users_to_unfollow = (database) => database.getUsersFollowedBefore(Config.unfollow.delay_hours)

const olderFollowedDtSort = (a,b)=>(a.followed_dt < b.followed_dt)? -1:( a.followed_dt > b.followed_dt?1:0 ) ;

// Check if there is any user we can unfollow.
// Return true if a user has been unfollowed.
export const unfollow_loop = async ( instagram, database, logger ) => {

    let user;

    try {
        // Find user to unfollow
        let userList = database
            .getUsersFollowedBefore( Config.unfollow.delay_hours )
            .filter( e => !e.block_unfollow );
        
        if( userList.length && userList.length % 10 ===0)
            logger.info(`Remain ${userList.length} users to unfollow`);

        if (userList.length === 0) return false;

        user = userList.sort( olderFollowedDtSort )[0]; // Take the older follower.

        await instagram.profile(user.username).unfollow();;
        database.unfollowedUser(user.username)

        return true;

    } catch (e) {

        if (e instanceof ExceptionInstagramAccount404) {

            logger.warn(`User ${user.username} doesn't exists.`);
            database.removeUser(user.username);
        } else if (e instanceof ExceptionInstagramNotLoggedIn) {

            throw new ExceptionInstagramNotLoggedIn();

        } else if (e instanceof ExceptionInstagramNotFollowed) {

            logger.warn(`User ${user.username} not followed = not unfollowed.`);
            database.ignoredUser(user.username);
        } else {
            logger.error(e)
        }
    }
}