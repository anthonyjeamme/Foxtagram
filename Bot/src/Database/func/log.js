const cleanLogs = ( db ) => {
    
    var logs_collection = db
    .getCollection("logs");

    let n = logs_collection.find({});

    if( n.length > 50 ){
        
        logs
        .chain()
        .find({})
        .simplesort('$loki')
        .limit( n.length - 50 )
        .remove();
    }
}

export const logAskedFollow = ( db ) => username => {

    var logs_collection = db
    .getCollection("logs");

    let res = logs_collection.insert({
        username,
        type:"ask_follow"
    });

    cleanLogs(db)
}

export const logFollow = ( db ) => username => {

    var logs_collection = db
    .getCollection("logs");

    let res = logs_collection.insert({
        username,
        type:"follow"
    });

    cleanLogs(db)
    
}

export const logUnfollow = ( db ) => username => {

    var logs_collection = db
    .getCollection("logs");

    let res = logs_collection.insert({
        username,
        type:"unfollow"
    });

    cleanLogs(db)
}

export const getLogs = ( db ) => () => {
    
    var logs_collection = db
    .getCollection("logs");

    return logs_collection.find({});
}