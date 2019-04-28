
import {
    ExceptionInstagramPost404,
    ExceptionInstagramNotLoggedIn,
    ExceptionPostAlreadyLiked,
    ExceptionLikedBlocked
} from '../Exceptions';

import { timeout } from '../../lib/misc';

import { getURLParams } from '../url';

import { getSelector } from '../utils/Selectors'
import SELECTORS from '../utils/Selectors';

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

const openPost = ( nightmare, logger, requireLoggedIn=true )  => async postID => {

    let {
        $loadedMarker
    } = await getSelector( SELECTORS.CATEGORIES.POST );

    await nightmare
        .goto( `https://www.instagram.com/p/${postID}/` )
        .wait( $loadedMarker );

    if (await is404Page( nightmare )) throw new ExceptionInstagramPost404(username);
    if( !requireLoggedIn ) return;
    if (!await isLoggedIn(nightmare)) throw new ExceptionInstagramNotLoggedIn();
}

const readBody = async ( nightmare, logger ) => {

    let {
        $profileName,
        $description,
        $nbLikes,
        $profileImg
    } = await getSelector( SELECTORS.CATEGORIES.POST );

    await nightmare.wait( $profileName );

    let username
        = await nightmare.evaluate( $=>document.querySelector($).innerText, $profileName );
    
    let description
        = await nightmare.evaluate( $=>document.querySelector($).innerText, $description );

    let hashtags
        = description.replace('#',' #').split(' ').filter(e=>e[0]==="#");

    let nb_likes = parseInt(
            (
                await nightmare.evaluate( $=>document.querySelector($)?document.querySelector($).innerText:"0", $nbLikes )
            ).replace( /[^0-9]/g, '' )
        );

    let photo_uri
        = await nightmare.evaluate( $=>document.querySelector($)?document.querySelector($).src:"", $profileImg );

    return ({
        username,
        description,
        hashtags,
        nb_likes,
        photo_uri
    });
}

const eval_getComments = $=>{
            
    let n_comments = document.querySelectorAll($).length -1;
    let comments = [];

    for( let i=1; i<n_comments+1; i++ ){

        let content = document.querySelectorAll($)[i].querySelector('span').innerText;
        comments.push({
            username :document.querySelectorAll($)[i].querySelector('a').innerText,
            content,
            hashtags: content.replace("#"," #").split(" ").filter(e=>e[0]==="#")
        });
    }

    return comments;
}

const interceptAjaxQueryURL = ( nightmare, logger ) => async ( action, urlIncludes='graphql/query/?' ) => {

    var graphQLURL = null;

    const didGetResponseDetails =  (_a, _b, url) => {

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

const interceptAjaxQueryStatusCode = ( nightmare, logger ) => async ( action, urlIncludes='web/likes/' ) => {

    var statusCode = null;

    const didGetResponseDetails =  (_a, _b, url, originalUrl, code) => {

        if (url.includes('/graphql/query/') && decodeURIComponent( url ).includes( urlIncludes )) {

            statusCode = code;
        }
    };

    await nightmare
        .on('did-get-response-details',didGetResponseDetails )
    
    await action();

    // waiting for ajax query to graphql
    while (statusCode===null) await timeout(200); // better solution ?

    await nightmare.removeListener( 'did-get-response-details', didGetResponseDetails);

    return statusCode;
}

const readComments = async ( nightmare, logger, maxExtraction=1000 ) => {

    // TODO detect when post owner comment his own post ?
    
    let {
        $moreCommentButton,
        $comments
    } = await getSelector( SELECTORS.CATEGORIES.POST );

    let noMoreCommentButton = await nightmare
        .evaluate( $=>document.querySelector($) == null, $moreCommentButton );

    let comments = [];

    if( noMoreCommentButton ){

        let comments = await nightmare
            .evaluate( eval_getComments, $comments );

        return comments;

    }
    else {
        
        let graphqlURI = await interceptAjaxQueryURL( nightmare, logger )( ()=>{
            
            return nightmare
            .click( $moreCommentButton )
            .wait(200)
        });

        let params = getURLParams(graphqlURI);
        let variables = JSON.parse(params.variables);
        let newAjaxQueryURL = `https://www.instagram.com/graphql/query/?query_hash=${params.query_hash}&variables=${JSON.stringify({ shortcode:variables.shortcode, first:maxExtraction })}`;

        let json = await nightmare.goto(newAjaxQueryURL).evaluate(() => JSON.parse(document.body.innerText))

        return json.data.shortcode_media.edge_media_to_comment.edges.map(
            e=>({
                username: e.node.owner.username,
                content: e.node.text,
                hashtags: e.node.text.replace("#"," #").split(" ").filter(e=>e[0]==="#")
            })
        );
    }

    return comments;
}

const readLikes = async ( nightmare, logger, maxExtraction=1000 ) => {

    let {
        $likesLink
    } = await getSelector( SELECTORS.CATEGORIES.POST );


    let existsLikesLink = await nightmare
        .evaluate($=>document.querySelector($)!=null,$likesLink);

    if( !existsLikesLink ) return [];
    
    let graphqlURI = await interceptAjaxQueryURL( nightmare, logger )( ()=>{
            
        return nightmare
        .click( $likesLink )
        .wait(200)
    });

    let params = getURLParams(graphqlURI);
    let variables = JSON.parse(params.variables);
    let newAjaxQueryURL = `https://www.instagram.com/graphql/query/?query_hash=${params.query_hash}&variables=${JSON.stringify({ shortcode:variables.shortcode, first:maxExtraction })}`;

    let json = await nightmare.goto(newAjaxQueryURL).evaluate(() => JSON.parse(document.body.innerText))

    return json.data.shortcode_media.edge_liked_by.edges.map(
        e=>({
            username: e.node.username
        })
    );
}

export default ( nightmare, logger ) => postID => ({

    read: async ( doReadComments=false, doReadLikes=false ) => {

        logger.info(`Read ${postID}`);

        await openPost( nightmare, logger )( postID );

        let body = await readBody( nightmare, logger );

        let comments = [];
        if( doReadComments ){
            comments = await readComments( nightmare, logger, 1000 );

            await openPost( nightmare, logger )( postID );
        }

        let likes = [];
        if( doReadLikes ){
            likes = await readLikes( nightmare, logger, 1000 );
        }
        // comments

        return Object.assign({},
            body, 
            {
                comments,
                likes
            }
        );
    },

    like: async () => {

        let {
            $likeLink,
            $alreadyLikedMark
        } = await getSelector( SELECTORS.CATEGORIES.POST );

        logger.info( `Liking ${postID}` );

        await openPost( nightmare, logger )( postID );

        let alreadyLiked = await nightmare
            .evaluate(
                ($,$1)=>document.querySelector($).querySelector($1)!=null
                , $likeLink
                , $alreadyLikedMark
            );
        
        if( alreadyLiked ) throw new ExceptionPostAlreadyLiked( postID );

        let statusCode = await interceptAjaxQueryStatusCode( nightmare, logger ) ( ()=>{
            return nightmare
            .click( $likeLink )
        }
        ,'web/likes/');

        if( statusCode != 200 )
            throw new ExceptionLikedBlocked( postID );
    }
});
