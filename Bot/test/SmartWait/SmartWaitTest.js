import { smartwait } from '../../src/lib/smartwait'

import {
    timeout
} from '../../src/lib/misc'

var assert = require('assert');

describe('SmartWait', async () => {

    it('Time after last day period', ()=>{

        let date = new Date();
        date.setHours(23,30,0,0);

        let delay = smartwait( date );
    
        assert.notEqual(Infinity, delay);
    });
});
