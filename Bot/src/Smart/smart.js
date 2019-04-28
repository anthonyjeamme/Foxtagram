import { getConfigAccount, getAppUserFolder } from '../lib/misc'

var fs = require('fs');
var mkdirp = require('mkdirp')

import GaussianMethod from './methods/gaussian'

// Compute score based on a learned model.
// Score between 0 and 100
export const computeScore = ( user, modelName= "gaussian" ) => {

    let model = loadModel(modelName);

    // Manual criterias
    if(
        user.n_followers > 3000 || user.n_followers<10 ||
        user.n_following < 10 || user.n_following > 2000 ||
        user.n_posts < 2
    )
        return 0;

    // Choose method here.
    let score = GaussianMethod.compute( model, user ) * 100;
    
    if( !score ) return 0;
    return score;
}

export const loadModel = (method) => {

    let configAccount = getConfigAccount();
    let appUserFolder = getAppUserFolder();

    let file = `${appUserFolder}/smart/${configAccount}_${method}_model.json`;

    if( !fs.existsSync( file ) ){
        mkdirp(`${appUserFolder}/smart/`);
        fs.writeFileSync( file, JSON.stringify({"x0":400,"y0":400,"sigmaX":1000,"sigmaY":1000}) );
    }

    return JSON.parse( fs.readFileSync( file ) );
}

export const saveModel = (model, method) => {

    let configAccount = getConfigAccount();
    let appUserFolder = getAppUserFolder();
    let smartFolder = `${appUserFolder}/smart`;

    mkdirp( smartFolder );

    let file = `${smartFolder}/${configAccount}_${method}_model.json`;

    fs.writeFileSync( file, JSON.stringify( model ) )
}