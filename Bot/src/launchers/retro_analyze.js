import Database from '../Database/Database';

import Scanner from '../Scanner/Scanner';
import Instagram from '../Instagram/Instagram';

import Constants from '../lib/constants'

import logger from '../lib/logger';
import {readConfigFile} from '../lib/misc'

var Config = readConfigFile();
const App = async() => {

    let database = new Database();
    await database.isReady();


    let users = database.getUsers({
        state: Constants.FOLLOWED
    });

    users.forEach(user=>{

        user.sources.forEach(target=>{
            database.newTargetFollow( target );
        })

    })

    await database.close();

    console.log("finit");

};

App();