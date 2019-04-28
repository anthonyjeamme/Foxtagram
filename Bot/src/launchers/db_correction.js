import { saveModel, loadModel, computeScore} from '../Smart/smart';

import Constants from '../../src/lib/constants'

import Database from '../Database/Database'

const App = async () => {

    let database = new Database();
    await database.isReady();

    let user_collection = database.db
    .getCollection("users");

    let data = user_collection.find({
        state:Constants.ASK_FOLLOW
    });

    console.log(data.map(({username})=>({
        username
    })));
    console.log(data.length);
}

App();
