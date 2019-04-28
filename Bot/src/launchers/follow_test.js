import Database from '../Database/Database';

import Follower from '../Follower/Follower';

import logger from '../lib/logger';
import Instagram from '../Instagram/Instagram';

import {readConfigFile} from '../lib/misc'
var Config = readConfigFile();

const App = async () => {

    let database = new Database();
    await database.isReady();

    let instagram = new Instagram({show:true});

    let account = Config.accounts.others[0];
    await instagram.session().login( account );

    // instagram.hashtag("afrofashion" ).getTopPostsURI();
    // instagram.hashtag("afrofashion" ).getRecentPostsURI();

    // big page BhVIGe9nXlT
    // small page Bex9yGngII9

    // console.log( await instagram.post("BhVIGe9nXlT" ).read( true, true ) );
    //await instagram.post("BhVIGe9nXlT" ).like();

    let result = await instagram.post( "Bhaus9kgp3Q" ).read( true, true );

    console.log(result);

    database.close();
    //instagram.close();
};

App();