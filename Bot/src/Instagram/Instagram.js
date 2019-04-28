import Nightmare from 'nightmare';
import Constants from '../lib/constants';

import {
    ExceptionInstagramNoInternet,
    ExceptionInstagramAccount404,
    ExceptionInstagramNotLoggedIn,
    ExceptionInstagramAlreadyFollowed,
    ExceptionInstagramAlreadyAskFollow,
    ExceptionInstagramNotFollowed,
    ExceptionInstagramLikesLinkNotFound,
    ExceptionFollowBlocked,
    ExceptionUnfollowBlocked,
    ExceptionInstagramLoginSuspect,
    ExceptionInstagramLoginFailed
} from './Exceptions';

import { getURLParams } from './url';

import { timeout } from '../lib/misc';

import { ExceptionAskedFollowNotAnalyzedUser } from '../Database/Database';

import { getSelector } from './utils/Selectors';
import SELECTORS from './utils/Selectors';

import { saveProfileImg } from '../lib/appdata';

import logger from '../lib/logger';

// Instagram dep.
import profile from './func/profile';
import session from './func/session';
import hashtag from './func/hashtag';
import post    from './func/post';

// Test if you are logged in.
const is_logged_in = async (nightmare) => {
    let { $notLoggedInMarker } = await getSelector(SELECTORS.CATEGORIES.PROFILE)
    return await nightmare.evaluate(($notLoggedInMarker) => document.querySelector($notLoggedInMarker) == null, $notLoggedInMarker);
}

// Warning : Some pages doesn't display likes (big pages).
export const get_post_likers = ( nightmare, logger ) => async ( postID ) => {

    let url = `https://www.instagram.com/p/${postID}/`;
    let number = 1000; // TODO
    
    // TODO When few likers : display inline.

    const getGraphQLURL = async () => {

        try{
            var graphQLURL = null;

            let likesLink = 'a._nzn1h';

            await nightmare
                .goto(url)
                .wait('._1w76c')
                .wait(1000);

            const didGetResponseDetails = (_a, _b, url) => {

                if (url.includes('/graphql/query/') && decodeURIComponent(url).includes('"first":20')) {

                    let params, newURL, variables;

                    params = getURLParams(url);
                    variables = JSON.parse(params.variables);

                    graphQLURL = `https://www.instagram.com/graphql/query/?query_hash=${params.query_hash}&variables=${JSON.stringify({ shortcode:variables.shortcode, first:number })}`;
                }
            };

            await nightmare
                .on('did-get-response-details', didGetResponseDetails)
                .wait(200);

            await nightmare
                .click('a._nzn1h')
                .wait(200)
                
            // waiting for ajax query to graphql
            while (!graphQLURL) {
                await timeout(200); // better solution ?
            }

            await nightmare.removeListener( 'did-get-response-details', didGetResponseDetails );

            return graphQLURL;
        }catch(e){

            throw new ExceptionInstagramLikesLinkNotFound( postID );
        }
    }

    try{
        let graphURL = await getGraphQLURL();

        let json = await nightmare.goto(graphURL).evaluate(() => JSON.parse(document.body.innerText))

        // TODO Here handle when instagram block calls.

        return json.data.shortcode_media.edge_liked_by.edges.map(({
            node
        }) => node);

    } catch( e ){

        if( e instanceof ExceptionInstagramLikesLinkNotFound ){
            logger.warn( e.message );
        }
        else{
            logger.error( e );
        }

        return [];
    }
}

export const get_post_commentators =  ( nightmare, logger ) => async ( postID ) => {

    let url = `https://www.instagram.com/p/${postID}/?__a=1`;

    let json = await nightmare.goto( url ).evaluate(() => JSON.parse(document.body.innerText))

    return json
        .graphql
        .shortcode_media
        .edge_media_to_comment
        .edges
        .map(e=>e.node);
}

export const get_user_last_reacting_users = ( nightmare, logger ) => async ( account, n_post=1 ) => {
    
    // TODO date to filter data ?

    logger.info(`loading ${account} last reacting users`);

    let link = await nightmare
    .goto(`https://www.instagram.com/${account}`)
    .wait('a._t98z6')

    let links = [];

    try{
        for( var i=0; i<n_post; i++ ){
            links.push(
                await nightmare
                .evaluate((i)=> document.querySelector('._mck9w._gvoze._tn0ps:nth-child('+(i+1)+') a').href,i)
            )
        }
    } catch(e){
        // When the post n°[i] doesn't exists. Nothing to do.
    }
    
    let extractPostIdRegex = /https\:\/\/www.instagram.com\/p\/(.*)\/\?.*/;
    let postsID = links.map(e=>e.match( extractPostIdRegex )[1])

    let result = [];

    for( var i=0; i<postsID.length; i++ ){

        let postID = postsID[i];

        let likers = await get_post_likers( nightmare, logger )( postID );
        let commentators = await get_post_commentators( nightmare, logger )( postID );

        likers.forEach(u => {
            result.push(Object.assign({},u,{ liked:postID }))
        });
        commentators.forEach(u => {

            result.push(Object.assign({},u.owner,{ commented:{postID, text:u.text, id:u.id} }))
        });
    }

    return result;
}
//document.querySelectorAll('._mck9w._gvoze._tn0ps')

const end = async () => {
    return await nightmare.end().then();
}

export default class Instagram {

    constructor(param = {
        show: false
    },  webPreferencesImage= false ) {

        this.logger = logger.getLogger('instagram'); // Default logger.

        this.nightmare = Nightmare({
            
            show: param.show,
            webPreferences: {
                images: webPreferencesImage
            }
        });

        this.nightmare.useragent("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0");
    }

    setLogger(logger) {
        this.logger = logger;
    }

    // TODO unused ?
    reloadNightmare( show ){
        this.nightmare = Nightmare({
            
            show,
            webPreferences: {
                images: false
            }
        });
    }

    async get_user_last_reacting_users(username, n_posts){
        return await get_user_last_reacting_users( this.nightmare, this.logger )(username, n_posts);
    }

    // TODO delete every method above this line.

    profile( username ){
        // [ ] profile( username ).getLastReactingUsers();
        // [X] profile( username ).read( ?details );
        // [X] profile( username ).follow();
        // [X] profile( username ).unfollow();
        return profile( this.nightmare, this.logger ) ( username );
    }

    post( postID ){

        return post( this.nightmare, this.logger ) ( postID );
    }

    hashtag( hashTag ){

        return hashtag( this.nightmare, this.logger ) ( hashTag );
    }

    session(){

        // [ ] session().logIn()
        // [ ] session().logInSuspect();
        return session( this.nightmare, this.logger );
    }

    async close(){
        await  this.nightmare.end().then();
    }
}