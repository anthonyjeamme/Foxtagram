
import {
    ExceptionInstagramPost404,
    ExceptionInstagramNotLoggedIn
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

const openHashtag = ( nightmare, logger )  => async ( hashTag, requireLoggedIn=true ) => {

    let {
        $loadedMarker
    } = await getSelector( SELECTORS.CATEGORIES.HASHTAG );

    await nightmare
        .goto(`https://www.instagram.com/explore/tags/${hashTag}/`)
        .wait( $loadedMarker );

    if (await is404Page( nightmare )) throw new ExceptionInstagramPost404(username);
    if( !requireLoggedIn ) return;
    if (!await isLoggedIn(nightmare)) throw new ExceptionInstagramNotLoggedIn();
}


const interceptAjaxQueryURLActionLoop = ( nightmare, logger ) => async ( action, urlIncludes='graphql/query' ) => {

    var graphQLURL = null;

    const didGetResponseDetails =  (_a, _b, url) => {

        if (url.includes('/graphql/query/') && decodeURIComponent( url ).includes( urlIncludes )) {
            graphQLURL = url;
        }
    };

    await nightmare
        .on('did-get-response-details',didGetResponseDetails );
    
    // waiting for ajax query to graphql
    while (!graphQLURL){
        await action();
        await timeout(500); // better solution ?
    }

    await nightmare.removeListener( 'did-get-response-details', didGetResponseDetails);

    return graphQLURL;
}


export default ( nightmare, logger ) => hashTag => ({

    read: async ( maxExtraction=9 ) => {

        logger.info(`read`);

        await openHashtag( nightmare, logger ) ( hashTag );

        let graphqlURI = await interceptAjaxQueryURLActionLoop( nightmare, logger ) (()=> {

            return nightmare.scrollTo( 100000,0 );
        },"graphql/query");

        let params = getURLParams(graphqlURI);
        let variables = JSON.parse(params.variables);
        let newAjaxQueryURL = `https://www.instagram.com/graphql/query/?query_hash=${params.query_hash}&variables=${JSON.stringify({ tag_name:variables.tag_name, first:maxExtraction })}`;

        let json = await nightmare.goto( newAjaxQueryURL ).evaluate(() => JSON.parse( document.body.innerText ))

        return ({
            recent: json.data.hashtag.edge_hashtag_to_media.edges.map(
                e=>({
                    postID: e.node.shortcode
                })
            ),
            top: json.data.hashtag.edge_hashtag_to_top_posts.edges.map(
                e=>({
                    postID: e.node.shortcode
                })
            )
        });
    }
});
