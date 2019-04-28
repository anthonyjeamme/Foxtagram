import Database from '../../src/Database/Database';
import logger from '../../src/lib/logger';

import {
    timeout
} from '../../src/lib/misc'

var assert = require('assert');
import Server from '../../src/Server/Server';

describe('Server', async () => {

    let database = new Database({
        id: "unit_test_server"
    });

    it('Launch Server', async () => {

        Server.start(database, logger.getLogger('test'), 8081);

        let running = await Server.isRunning();
        assert(running);
    });

    await timeout(1000);
    Server.stop();
});
