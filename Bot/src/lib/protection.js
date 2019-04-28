import fetch from 'node-fetch';

let foxtagramServer = "http://foxtagram-ws.herokuapp.com/";

export const checkKey = async ( key ) => {

    if( !key ) return false;
    if( key.length<20 ) return false;

    return await fetch(foxtagramServer + "key/"+key)
        .then(d => d.json())
        .then((d) => {

            if( d.available ) return false;

            return d.active;
        });
}