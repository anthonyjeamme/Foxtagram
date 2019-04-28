import { saveModel, loadModel, computeScore} from '../Smart/smart';

import Database from '../Database/Database'

const fakeUser = ( posts=10, followers=200, followings=200 ) => {

    return {username:"fake",posts,followers,followings};
}

const App = async () => {

    let database = new Database();
    await database.isReady();

    const test =( x,y ) => {
        
        let user = fakeUser( 10,x,y )
        let score = computeScore( user );

        console.log(x,y,"=>",score);
    }

    test(400,400);
    test(50,50)
    test(1000,50)
    test(2000,50)
    test(3000,50)


    process.exit();
}

App();