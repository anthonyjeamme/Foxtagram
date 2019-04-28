import { api } from 'appconfig';

import Auth from 'auth';

const generateHeaders = () => 
    new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${new Auth().getAccessToken()}`, 
    });

export const getUserAccounts = () =>
    fetch(
        api+"/me/accounts",
        { headers: generateHeaders() }
    )
    .then(data=>data.json());


export const postUserAccounts = ( username, password ) => (
    fetch(
        api+"/me/accounts",
        {
            headers: generateHeaders(),
            body: {
                username, password
            }
        }
    ).then(data=>data.json())
)

const _get = ( path ) => (
    fetch(
        api+path,
        { headers: generateHeaders() }
    )
    .then(data=>data.json())
)

const _post = ( path, body={} ) => (
    fetch(
        api+path,
        {
            headers: generateHeaders(),
            method: "post",
            body: JSON.stringify( body )
        }
    )
    .then(data=>data.json())
)

const _patch = ( path, body={} ) => (
    fetch(
        api+path,
        {
            headers: generateHeaders(),
            method: "patch",
            body: JSON.stringify( body )
        }
    )
    .then(data=>data.json())
)

const _delete = ( path, body={} ) => (
    fetch(
        api+path,
        {
            headers: generateHeaders(),
            method: "delete",
            body: JSON.stringify( body )
        }
    )
    .then(data=>data.json())
)

export default {
    GetMe:()=>{
        return _get("/me");
    },
    PostAccount:( data )=>{
        return _post("/me/accounts", data);
    },
    DeleteAccount:( accountid )=>{
        return _delete(`/me/accounts/${accountid}`);
    },
    PostAccountSpy:( accountid, data )=>{
        return _post(`/me/accounts/${accountid}/spys/`, data);
    },
    DeleteAccountSpy:( accountid, spy )=>{
        return _delete(`/me/accounts/${accountid}/spys/${spy}`)
    },
    PostAccountObjective:( accountid, data )=>{
        return _post(`/me/accounts/${accountid}/objective`, data);
    },
    DeleteAccountObjective:( accountid )=>{
        return _delete(`/me/accounts/${accountid}/objective`);
    },
    PatchAccountRun:( accountid, data )=>{
        
        return _post(`/me/accounts/${accountid}/run`, data)
    },
    PostPayment: ( data ) => {
        return _post("/me/payment", data);
    }
}