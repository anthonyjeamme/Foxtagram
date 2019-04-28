import Database from '../Database/Database';

import Server from '../Server/Server';

import logger from '../lib/logger';

const App = async () => {

    let database = new Database();
    await database.isReady();

    Server.start( database, logger.getLogger('server'), 8080 );
};

App();