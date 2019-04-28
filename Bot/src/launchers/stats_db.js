import Database from '../Database/Database';
import Constants from '../lib/constants';
import Instagram from '../Instagram/Instagram';


import { computeScore } from '../Smart/smart';


import { readConfigFile } from '../lib/misc'
var Config = readConfigFile();

const App = async () => {

    let db_url = process.argv[process.argv.length-1]

    let database = new Database({
        db_file_path:db_url
    });
    await database.isReady();

    let users = database.getUsers({})

    console.log(users.length);
    console.log(users.filter(e=>e.legacy).length);


    //console.log( database.getUsers({state:Constants.ANALIZED}).map(({username,score})=>({username,score})) );

}

App();