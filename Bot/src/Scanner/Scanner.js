/*
 * Main Scanner source file.
 * 
 * 1) Scan targetted profiles & hashtag to find
 *    good profiles for the Bot. (follow, unfollow and so on.)
 * 2) Analyze extracted profiles. Attribute a score on each of them.
 *    The bot will use this score to select best profiles.
 * 
 * When scanning, we can extract lot of profiles.
 * Then database size can grow fast. There is optimisations
 * functions that keep reasonable database size.
 */

import Instagram from '../Instagram/Instagram';
import {
    ExceptionInstagramNotLoggedIn,
    ExceptionInstagramLoginFailed,
    ExceptionInstagramLoginSuspect
} from '../Instagram/Exceptions';

import { timeout } from '../lib/time';

import { readConfigFile } from '../lib/misc';
var Config = readConfigFile();

// Scanner functions
import { scanner_loop } from './ScannerLoop';
import { wait_next_login_attempt, scanner_timeout } from './func/time';
import { getNInit } from './func/db';

const max_init_buffer = 5000;

// Start the scanner.
const start = async(database, logger, accountIndice=0, show=false) => {

    let isConnected = false;
    let instagram = new Instagram({show},true);

    logger.info('Scanner ready');

    instagram.setLogger(logger);

    while (true) {

        let ScannerStarted = database.getParams().scanner.started;
        if( ScannerStarted ){

            try{
                
                Config = readConfigFile();

                if( !isConnected )
                    isConnected = await instagram.session().login( Config.accounts.others[accountIndice] );

                database.setOtherAccountLoginError( Config.accounts.others[accountIndice].login ,false );

                while (database.getParams().scanner.started && isConnected) {

                    Config = readConfigFile();

                    try {

                        let n_init = getNInit(database);
                        if( n_init > max_init_buffer )
                            database.purgeInitUsers( logger,  n_init - max_init_buffer + 200 );

                        await scanner_loop( instagram, logger, Config )( database );
                        await scanner_timeout( database, logger );

                    } catch (e) {

                        if (e instanceof ExceptionInstagramNotLoggedIn) {
                            
                            logger.warn("You are not logged in.");
                            isConnected = false;
                        } else {

                            logger.error(e);
                        }
                    }
                }
            } catch (e){
                if( e instanceof ExceptionInstagramLoginFailed ) {
                    
                    database.setOtherAccountLoginError( Config.accounts.others[accountIndice].login ,true );
                    await wait_next_login_attempt( database, logger );
    
                } else if( e instanceof ExceptionInstagramLoginSuspect ){

                    logger.error("Account suspect");
                    database.setSuspectAccount( true );
                    await instagram.session().loginSuspect( Config.accounts.others[accountIndice] );
                    isConnected=true;
    
                } else logger.error( e )
            }
        }
        await timeout(5000); // Wait 5s before re-logging in.
    }
}

export default {
    start
};