import Database from '../Database/Database';
import Instagram from '../Instagram/Instagram';

var fs = require('fs');

import { readConfigFile } from '../lib/misc'
var Config = readConfigFile();

Array.prototype.eachAsync = async function(f){
for(let i=0;i<this.length;i++)await f(this[i])
}

const App = async () => {

    let instagram = new Instagram({show:true});

    let account = Config.accounts.others[0];
    await instagram.session().login( account );

    let data = await instagram.profile( account.login ).read( true );

    console.log( data );

    instagram.close();
};

App();