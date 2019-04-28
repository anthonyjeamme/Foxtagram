import Database from '../Database/Database';

import Scanner from '../Scanner/Scanner';

import logger from '../lib/logger';

const App = async () => {

    let database = new Database({db_file_path:"D:\\media\\Téléchargement\\data_default\\data_default.json"});
    await database.isReady();

    Scanner.start( database, logger.getLogger('scanner'), 0,  true );
};

App();