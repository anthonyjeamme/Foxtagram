import { timeout } from '../../lib/misc';
import { SECONDS, MINUTES, HOURS, DAYS } from '../../lib/time';
import Constants from '../../lib/constants';
import { getNAnalized } from './db';

// Determine time to wait between 2 scanner actions.
export const scanner_timeout = async ( database, logger ) => {

    let time_ms;
    let n_analyzed = getNAnalized( database );

    if( n_analyzed > 3000 )
        // Wait between 5 and 10 minutes
        time_ms = Math.round( Math.random()*5*MINUTES + 5*MINUTES );
    else if( n_analyzed > 2000 )
        // Wait between 2 and 5 minutes
        time_ms = Math.round( Math.random()*3*MINUTES + 2*MINUTES );
    else if( n_analyzed > 1500 )
        // Wait between 30s and 1 minutes
        time_ms = Math.round( Math.random()*30*SECONDS + 30*SECONDS );
    else if( n_analyzed > 1000 )
        // Wait between 15s and 1 minutes
        time_ms = Math.round( Math.random()*20*SECONDS + 15*SECONDS );
    else
        // Wait between 5s and 30s
        time_ms = Math.round( Math.random()*10*SECONDS + 5*SECONDS );

    // Randomly wait more.
    // Rush the 50 first analysis. So we don't wait.
    if( n_analyzed > 200 )
        Math.random() < 0.1 ?
            time_ms = Math.round( Math.random() * 10*MINUTES + 10*MINUTES )
            :{}; // Wait between 10 and 20 minutes

    logger.debug( `Waiting ${Math.round(time_ms/1000)} s` );

    await timeout( time_ms );
}

// Wait user to update password or max 12h
export const wait_next_login_attempt = async ( database, logger ) => {

    let interval = 2000;
    let max_loop = 12*HOURS; // if no update from user after 12 hours, try again.
    let i=0;

    logger.warn('Waiting user to change password.');

    while( i < max_loop / interval ){
        if( !database.getOtherAccountLoginError()) return;
        await timeout(2000);
        i++;
    }
}
