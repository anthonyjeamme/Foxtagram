/*
 * This file handle Instagram Selector
 * (example: selector for login field when login)
 * 
 * If Instagram change some class or id, we need to update Foxtagram.
 * This class make the update easier.
 */

import { getAppUserFolder } from '../../lib/misc';

import { HOURS } from '../../lib/time';

var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');

const selectorFile = `${getAppUserFolder()}/instagram/selectors.json`;

let selectors = null;

let lastSelectorUpdate = 0;

/*
 * Check update on remote server.
 */
export const updateSelector = ( logger=null ) => new Promise((resolve, reject)=>{

    if( Date.now() < lastSelectorUpdate + 1*HOURS ) return;

    let selectorURI = 'https://foxtagram.herokuapp.com/data/instagram/selectors.json';

    if( logger ) logger.info('Check Instagram Selectors update');
    
    request.get(selectorURI,(err,response)=>{

        if(err) { reject(); return; }

        let remoteSelectors = JSON.parse(response.body); 

        if( selectors === null || remoteSelectors.version > selectors.version ){

            selectors = remoteSelectors;
            fs.writeFileSync(selectorFile,JSON.stringify(remoteSelectors));
            lastSelectorUpdate = Date.now();
            if( logger ) logger.info('Instagram Selectors Updated');
        }

        resolve();
    })
});

/*
 *
 */
export const getSelector = async ( category, logger=null ) => {

    if( selectors === null ){
        if( !fs.existsSync(selectorFile) ){
            
            mkdirp(`${getAppUserFolder()}/instagram/`);
            await updateSelector( logger )
        }
        selectors = JSON.parse(fs.readFileSync(selectorFile))
    }

    //updateSelector( logger ); // TODO move that.

    return selectors[category];
};

// TODO Add categories.
const CATEGORIES = {
    LOGIN:"login",
    PROFILE:"profile",
    POST:"post",
    HASHTAG:"hashtag"
};

export default {
    CATEGORIES
};