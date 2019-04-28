import Database from '../Database/Database';

import Constants from '../lib/constants'

const App = async () => {

    let database = new Database({
    });
    await database.isReady();

    

    let user_collection = database
        .db
        .getCollection("users");

    let users = user_collection.find({
        legacy: true,
        block_unfollow:true,
    })//.filter(e=>e.unfollowed_dt==null);

    users.forEach(u=>{

        console.log(u.username);
    })

    console.log(users.length)

    await database.close();

};

App();