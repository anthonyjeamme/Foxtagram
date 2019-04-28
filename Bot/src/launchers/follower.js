import Database from '../Database/Database';

import Follower from '../Follower/Follower';

import logger from '../lib/logger';

const App = async () => {

    let database = new Database();
    await database.isReady();

    Follower.start( database, logger.getLogger('follower') );

};

App();