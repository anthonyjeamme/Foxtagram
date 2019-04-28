// Used with await.
export const timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
} // TODO moved to time.js

export const randomize = ratio => Math.random() > ratio;

const initConfigFile =  {
    "key":null,
    "accounts": {
        "main": {},
        "others": []
    },
    "unfollow": {
        "delay_hours": 72
    },
    "follower": {
        "periods": [{
            "from": "01:00",
            "to": "22:00"
        }]
    },
    "flash": {
        "hour_delay": 1
    }
}

export const getAppUserFolder = () => {

    return process.env.APPDATA+"/foxtagram";
}

export const readConfigFile = () => {

    let path = getAppUserFolder()+"/foxtagram.config.json";

    let fs = require('fs');

    if( !fs.existsSync(getAppUserFolder()) ){
        fs.mkdirSync(getAppUserFolder());
        fs.writeFileSync( path, JSON.stringify(initConfigFile) )
    }

    let config = JSON.parse( fs.readFileSync(path))

    return config;
}

export const saveConfigFile = (config)=>{
    
    let path = getAppUserFolder()+"/foxtagram.config.json";

    let fs = require('fs');

    fs.writeFileSync(path, JSON.stringify(config));
}

export const getConfigAccount = () =>{
    let config = readConfigFile();
    return config.accounts.main.login;
}

export function ExceptionBadKey( key ) {
    this.message = `Bad Key (${key})`;
    this.name = 'ExceptionBadKey';
}