let db_url = "mongodb://foxtagram:je0iWoagcz7HWm7cYqqlzRGI6w9CDb@ds211309.mlab.com:11309/heroku_z2gfrx7z";

var mongoose = require('mongoose');
mongoose.connect(db_url);
var uniqid = require('uniqid')

var userSchema = mongoose.Schema({
    id: String,
    account_type: String,
    account_type_end_dt: Date,
    accounts: [
        {
            id: String,
            username: String,
            password: String,
            profileImage: String,
            followers: Number,
            following: Number,
            run: Boolean,
            spys:[
                {
                    name: String,
                    n_follow: Number,
                    n_follow_back: Number
                }
            ]
        }
    ]
});

var User = mongoose.model('user', userSchema);

function createAccount ( username, password ){
    return {
        id: uniqid("account_"),
        username,
        password,
        profileImage: "/img/emptyProfile.png",
        followers: 0,
        following: 0,
        spys:[],
        objective: null
    }
}

module.exports = {
    User,
    createAccount
};
