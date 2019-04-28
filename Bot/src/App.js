import Database from './Database/Database';

import Server from './Server/Server';
import Scanner from './Scanner/Scanner';
import Follower from './Follower/Follower';

import { updateSelector } from './Instagram/utils/Selectors'

import { timeout, moveFromOnboarding, readConfigFile } from './lib/misc';

import logger from './lib/logger';

import { HOURS } from './lib/time';

import { checkKey } from './lib/protection';

/*
 * Wait onboarding ended
 */
const onBordingEnded = async database =>{

    let onboarding = database.isOnBoarding();

    while( onboarding ){

        await timeout(2000);
        onboarding = database.isOnBoarding();
    }
}

const end = async ( database ) => {

    await database.close();
    Server.stop();
    process.exit();
}

/*
 * Main function, launch the 3 components of Foxtagram.
 * 
 * The Database is LokiJS (in-memory Database).
 * 
 * Each component has 1 log file.
 */
const App = async () => {

    // Database instance used by each component of Foxtagram..
    let database = new Database();
    await database.isReady();

    // Check if selector update exists.
    await updateSelector();
    setInterval(updateSelector, 1 * HOURS );

    // Web Service to Manage Foxtagram from the Web.
    Server.start( database, logger.getLogger('server'), 44333 );
    Server.openBrowser();
    
    await onBordingEnded( database );

    let Config = readConfigFile();

    while( !await checkKey(Config.key) ){
        
        logger.getLogger('server').error('Bad key');
        database.setKeyError(true);
        await timeout(2000);
        Config = readConfigFile();
    }
    database.setKeyError(false);

    // Find new Users to follow.
    Scanner.start( database, logger.getLogger('scanner'), 0, false );

    // Follow users find by the scanner.
    Follower.start( database, logger.getLogger('follower'), false );
};

App();