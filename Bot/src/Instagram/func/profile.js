
import {
    ExceptionInstagramAccount404,
    ExceptionInstagramNotLoggedIn,
    ExceptionInstagramAlreadyFollowed,
    ExceptionInstagramAlreadyAskFollow,
    ExceptionInstagramNotFollowed,
    ExceptionFollowBlocked,
    ExceptionUnfollowBlocked
} from '../Exceptions';

import { getSelector } from '../utils/Selectors'
import SELECTORS from '../utils/Selectors';

import Constants from '../../lib/constants';

import { timeout } from '../../lib/misc';

import { getURLParams } from '../url';

// true if current page is a 404 page.
const is404Page = async ( nightmare ) => {
    
    let { $404marker } = await getSelector( SELECTORS.CATEGORIES.PROFILE );
    let error404 = await nightmare.evaluate(($) => document.querySelector( $ ) !== null,$404marker);
    return error404;
}

// Test if you are logged in.
const isLoggedIn = async (nightmare) => {

    let { $notLoggedInMarker } = await getSelector(SELECTORS.CATEGORIES.PROFILE);
    return await nightmare.evaluate(($) => document.querySelector($) == null, $notLoggedInMarker);
}

const openProfile = async ( nightmare, username, requireLoggedIn=true ) => {
    
    await nightmare.goto(`https://www.instagram.com/${username}`).wait('body');

    if (await is404Page( nightmare )) throw new ExceptionInstagramAccount404(username);

    if( !requireLoggedIn ) return;

    if (!await isLoggedIn(nightmare)) throw new ExceptionInstagramNotLoggedIn();
}

// To get data, Instagram make Ajax Query.
// In order to get data we want, we need to read
// the ajax query made by Instagram, containing
// a query_hash.
// Then we are able to make ajax query by ourself.
const interceptAjaxQueryURL = ( nightmare, logger ) => async ( action, urlIncludes='"first":' ) => {

    var graphQLURL = null;

    const didGetResponseDetails =  (_a, _b, url) => {

        url = decodeURIComponent(url);

        if (url.includes('/graphql/query/') && decodeURIComponent( url ).includes( urlIncludes )) {
            graphQLURL = url;
        }
    };

    await nightmare
        .on('did-get-response-details',didGetResponseDetails )
    
    await action();

    // waiting for ajax query to graphql
    while (!graphQLURL) await timeout(200); // better solution ?

    await nightmare.removeListener( 'did-get-response-details', didGetResponseDetails);

    return graphQLURL;
}

// Read what is displayed in profile page
// (n_posts, n_following, n_followers).
const readMainInfos = (nightmare, logger) => async ( profileURI ) => {

    let {
        $nFollowers, $nFollowing, $profileImg, $nPosts
    } = await getSelector(SELECTORS.CATEGORIES.PROFILE, logger);


    if( await nightmare.url() != profileURI )
        await nightmare.goto( profileURI )

    let n_followers = await nightmare
        .evaluate(
            $ => parseInt(document.querySelector( $ ).title.replace(/[^0-9]/g,'')), $nFollowers
        );

    let n_following = await nightmare
        .evaluate(($nFollowing)=>parseInt(document.querySelector( $nFollowing ).innerText.replace(' ','')),$nFollowing);

    let n_posts = await nightmare
    .evaluate(($nPosts)=> parseInt(document.querySelector( $nPosts ).innerText.replace(/[^0-9]/g,'') ), $nPosts);

    let profile_img_uri = await nightmare
        .evaluate(($profileImg)=>document.querySelector( $profileImg ).src, $profileImg);

    return { n_followers, n_following, n_posts, profile_img_uri };
}

// Return the following users list.
const readFollowersList = ( nightmare, logger ) => async ( profileURI ) => {

    let {
        $loadedMarker, $nFollowersLink
    } = await getSelector(SELECTORS.CATEGORIES.PROFILE, logger);

    if( await nightmare.url() != profileURI )
        await nightmare.goto( profileURI ).wait( $loadedMarker );

    let existFollowersLink = await nightmare
    .evaluate( ($nFollowersLink)=>document.querySelector($nFollowersLink)!=null ,$nFollowersLink) ;

    if( !existFollowersLink ){
        logger.warn("Followers link not found.");
        return [];
    }

    let url = await interceptAjaxQueryURL(nightmare, logger)( ()=>{

        return nightmare
            .click( $nFollowersLink )
            .wait(200)
    });

    // Format new URL
    let params = getURLParams(url);
    let variables = JSON.parse(params.variables);
    let newAjaxQueryURL = `https://www.instagram.com/graphql/query/?query_hash=${params.query_hash}&variables=${JSON.stringify({ id:variables.id, first:50 })}`;

    let json = await nightmare.goto(newAjaxQueryURL).evaluate(() => JSON.parse(document.body.innerText))

    return json.data.user.edge_followed_by.edges.map(({
        node
    }) => node);
}

// Return the followers list.
const readFollowingsList = ( nightmare, logger ) => async ( profileURI ) => {

    let {
        $loadedMarker, $nFollowingLink
    } = await getSelector(SELECTORS.CATEGORIES.PROFILE, logger);

    if( await nightmare.url() != profileURI )
        await nightmare.goto( profileURI ).wait( $loadedMarker );

    let existFollowingsLink = await nightmare
    .evaluate( ($nFollowingLink)=>document.querySelector($nFollowingLink)!=null ,$nFollowingLink) ;

    if( !existFollowingsLink ){
        logger.warn("Followings link not found.");
        return [];
    }

    let url = await interceptAjaxQueryURL(nightmare, logger)( ()=>{
        return nightmare
            .click( $nFollowingLink )
            .wait(200)
    } );

    // Format new URL
    let params = getURLParams(url);
    let variables = JSON.parse(params.variables);
    let newAjaxQueryURL = `https://www.instagram.com/graphql/query/?query_hash=${params.query_hash}&variables=${JSON.stringify({ id:variables.id, first:50 })}`;

    let json = await nightmare.goto(newAjaxQueryURL).evaluate(() => JSON.parse(document.body.innerText))

    return json.data.user.edge_follow.edges.map(({
        node
    }) => node);
}

const readPost = ( nightmare, logger ) => async ( postURI ) => {

    let {
        $loadedMarker, $description, $nbLikes
    } = await getSelector(SELECTORS.CATEGORIES.POST, logger);

    await nightmare.goto( postURI ).wait( $loadedMarker );

    let description = await nightmare
        .evaluate(($description)=>document.querySelector($description)?document.querySelector($description).innerText:null, $description);
    
    let descriptionHashTag 
        = descriptionHashTag = description.replace('#',' #').split(' ').filter(e=>e[0]=="#")

    let nbLikes = await nightmare
        .evaluate(($nbLikes)=>(
            document.querySelector($nbLikes)?
            parseInt(document.querySelector($nbLikes).innerText.replace(/[^0-9]/g,""))
            :0
        
        ), $nbLikes)

    return {
        descriptionHashTag,
        description,
        nbLikes
    }
}

// Return detailed last post list.
const readLastPosts = ( nightmare, logger ) => async ( profileURI ) => {

    let {
        $postLinks,
        $loadedMarker
    } = await getSelector(SELECTORS.CATEGORIES.PROFILE, logger);

    if( await nightmare.url() != profileURI )
        await nightmare.goto( profileURI ).wait( $loadedMarker );

    let nb_posts = await nightmare
        .evaluate( ($postLinks)=>document.querySelectorAll($postLinks).length ,$postLinks) ;

    let posts_link = [];

    for( var i=0; i<nb_posts; i++ ){
        posts_link.push( await nightmare
        .evaluate( ($postLinks,i)=>document.querySelectorAll($postLinks)[i].href ,$postLinks,i) )
        ;
    }

    let posts = [];

    for( var i=0; i<posts_link.length; i++){
        posts.push(await readPost(nightmare, logger)( posts_link[i] ));
    }

    return posts;
}

export default ( nightmare, logger ) => username => ({

    getLastReactingUsers: async () => {
        logger.info(`getLastReactingUsers`);
    },

    follow: async () => {

        logger.info( `Follow ${username}` );
        
        let {
            $followUnfollowButton,
            $notFollowedMarker,
            $followedOrAskedMarker
        } = await getSelector(SELECTORS.CATEGORIES.PROFILE);

        let buttonText;

        await openProfile( nightmare, username );

        buttonText = await nightmare
            .wait($followUnfollowButton)
            .evaluate(
                ( $ ) => document.querySelector($).innerText,
                $followUnfollowButton
            );

        let buttonClassName = await nightmare
            .evaluate(( $ ) => document.querySelector($).className,
                $followUnfollowButton
            );

        if( buttonClassName.includes( $followedOrAskedMarker.replace(/[\. ]/g,"") ) ){

            // TODO make it multilanguage
            if (buttonText.includes('Requested') || buttonText.includes('Demandé'))
                throw new ExceptionInstagramAlreadyAskFollow();
            else
                throw new ExceptionInstagramAlreadyFollowed();

            // if (buttonText.includes('Following') || buttonText.includes('Abonné(e)'))
            // throw new ExceptionInstagramAlreadyFollowed();
        }

        let status = null;

        const didGetResponseDetails = (event, socketStatus, url, originalUrl, code, method, referrer, headers, type) => {

            if( /\/friendships\/([0-9]*)\/follow/.test(url) ){
                status = code;
                // TODO better if we could ready response content. (solution not found).
                // Other solution : inject xhr query in the code or find a solution to send POST query from electron (solution not found).
            }   
        }

        await nightmare.on('did-get-response-details', didGetResponseDetails )
        await nightmare.click($followUnfollowButton);
        while( !status ) await timeout(200);
        await nightmare.removeListener( 'did-get-response-details', didGetResponseDetails );

        if( status === 400 ) throw new ExceptionFollowBlocked();

        buttonText = await nightmare
            .wait($followUnfollowButton)
            .evaluate(($) => document.querySelector($).innerText,$followUnfollowButton);
        
        return ['Requested', 'Demandé'].includes(buttonText) ? Constants.ASK_FOLLOW : Constants.FOLLOWED;
        
    },

    unfollow: async () => {

        logger.info(`Unfollow ${username}`);
        
        let {
            $followUnfollowButton,
            $notFollowedMarker,
            $followedOrAskedMarker
        } = await getSelector(SELECTORS.CATEGORIES.PROFILE);

        let buttonText;

        await openProfile( nightmare, username );

        buttonText = await nightmare
            .wait( $followUnfollowButton )
            .evaluate(($) => document.querySelector($).innerText, $followUnfollowButton);

        if (
            buttonText.includes('Following') || buttonText.includes('Abonné(e)') ||
            buttonText.includes('Requested') || buttonText.includes('Demandé')) {

            let status = null;

            const didGetResponseDetails = (event, socketStatus, url, originalUrl, code, method, referrer, headers, type) => {
        
                if( /\/friendships\/([0-9]*)\/unfollow/.test(url) ){
                    status = code;
                    // TODO better if we could ready response content. (solution not found).
                    // Other solution : inject xhr query in the code or find a solution to send POST query from electron (solution not found).
                }   
            }

            await nightmare
            .on('did-get-response-details', didGetResponseDetails )

            await nightmare
                .click($followUnfollowButton);

            while( !status )
                await timeout(200);
        
            await nightmare.removeListener( 'did-get-response-details', didGetResponseDetails );

            if( status === 400 ) throw new ExceptionUnfollowBlocked();
                
            buttonText = await nightmare
                .wait($followUnfollowButton)
                .evaluate(($) => document.querySelector($).innerText,$followUnfollowButton);

            return ['S’abonner', 'Follow'].includes(buttonText);

        } else {
            throw new ExceptionInstagramNotFollowed();
        }
    },

    read: async ( details=false ) => {

        // How it works ?
        // When you click on "followers" to load followers list, an ajax query is made.
        // The query ask the first 20 followers.
        // We want more than 20 followers. So we listen when the query is made, to get the query_hash (instagram security).
        // Then we make another query with the wanted number of followers (setted in the query).
        // Same with following.

        let {
            $loadedMarker
        } = await getSelector( SELECTORS.CATEGORIES.PROFILE, logger );

        logger.info(`Reading ${username} profile`);

        let profileURI = `https://www.instagram.com/${username}`;

        await openProfile( nightmare, username, true );

        let { n_followers, n_following, n_posts, profile_img_uri }
            = await readMainInfos( nightmare, logger )( profileURI );
        
        let followers  = [];
        let followings = [];
        let posts      = [];

        if( details ){

            followers  = await readFollowersList ( nightmare, logger )( profileURI );
            followings = await readFollowingsList( nightmare, logger )( profileURI );
            posts      = await readLastPosts     ( nightmare, logger )( profileURI );
        }
      //  posts
        //followers
       //following
        return {
            followers,
            followings,
            n_followers,
            n_following,
            posts,
            n_posts,
            profile_img_uri
        };
    }
});

