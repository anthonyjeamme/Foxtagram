import Database from '../../src/Database/Database';
import {timeout, getAppUserFolder} from '../../src/lib/misc';

var fs = require('fs');
import Constants from '../../src/lib/constants';

// Unit test libs
var assert = require('assert');
var chai = require("chai");

describe('Database', (done) => {

    // Each time we delete test db

    try {
        fs.unlinkSync(getAppUserFolder() + '/db/data_unit_test.json');
    } catch (e) {}

    let database = new Database({id: "unit_test"});

    afterEach(async() => {
        await database.isReady();
    });

    it('Constructor', () => {
        assert.notEqual(null, database.db);
    });

    describe('Params', () => {

        it('Get Params', () => {

            let params = database.getParams();

            assert(params != null);
        });

        it('Get Blocking state', ()=>{

            let blockingState = database.getBlockingState();

            assert(
                Object.keys(blockingState).includes( "follow" ) &&
                Object.keys(blockingState).includes( "unfollow" ) &&
                Object.keys(blockingState.follow).includes( "history" ) &&
                Object.keys(blockingState.follow).includes( "blocked" ) &&
                Object.keys(blockingState.unfollow).includes( "history" ) &&
                Object.keys(blockingState.unfollow).includes( "blocked" )
            );
        })

        it('Update Blocking state', ()=>{

            database.setFollowBlockingState( true );
            database.setUnfollowBlockingState( true );
            database.setUnfollowBlockingState( false );

            let blockingState = database.getBlockingState();

            assert(
                blockingState.follow.blocked===true &&
                blockingState.follow.history.length===1 &&
                blockingState.unfollow.blocked===false &&
                blockingState.unfollow.history.length===1
            )
        });
    });

    describe('Users', () => {

        beforeEach(() => {
            database.removeUsers();
            database.removeTargets();
        });

        it('Add User', async() => {

            let test_id = "t_UA";

            database.addTargetAccount(`${test_id}_target`);

            let newEntry = database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            assert.equal(1, newEntry);
        });

        it('Add User & Get User List', async() => {

            let test_id = "t_UB";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);
            let userList = database.getUsers({username: test_id});
            assert(userList.length === 1 && userList[0].state === Constants.INIT);
        });

        it('Add Users & Get Multiple User List', async() => {

            let test_id = "t_UB2";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: `${test_id}_1`
                }, {
                    username: `${test_id}_2`
                }, {
                    username: `${test_id}_3`
                }, {
                    username: `${test_id}_4`
                }

            ], `${test_id}_target`);
            let userList = database.getUsers({});
            assert(userList.length === 4);
        });

        it('Add Target To User', async() => {

            let test_id = "t_UC";

            database.addTargetAccount(`${test_id}_target1`);
            database.addTargetAccount(`${test_id}_target2`);

            let newEntry = database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target1`);

            let newEntry_bis = database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target2`);

            let userList = database.getUsers({username: test_id});

            assert(userList.length === 1 && userList[0].sources.includes(`${test_id}_target1`) && userList[0].sources.includes(`${test_id}_target2`));
        });

        it('Add User with unknown source -> throw', async() => {

            let test_id = "t_UD";

            chai.expect(() => {

                database.addUsers([
                    {
                        username: test_id
                    }
                ], "t_UD_target_unknown");

            })
                .to
                .throw();
        });

        it('Add User & analyse', () => {

            let test_id = "t_UE";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.userAnalyzed(test_id, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            let userList = database.getUsers({username: test_id});

            assert(userList.length === 1 && userList[0].state === Constants.ANALIZED && userList[0].analysis_dt > Date.now() - 1000 * 10);
        });

        it('Add User & analyse & follow', () => {

            let test_id = "t_UF";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.userAnalyzed(test_id, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            database.followedUser(test_id)

            let userList = database.getUsers({username: test_id});

            assert(userList.length === 1 && userList[0].state === Constants.FOLLOWED && userList[0].followed_dt > Date.now() - 1000 * 10);
        });

        it('Add User & analyse & ask follow', () => {

            let test_id = "t_UG";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.userAnalyzed(test_id, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            database.askedFollowUser(test_id)

            let userList = database.getUsers({username: test_id});

            assert(userList.length === 1 && userList[0].state === Constants.ASK_FOLLOW && userList[0].private_account === true && userList[0].followed_dt > Date.now() - 1000 * 10);
        });

        it('Analyse Unknown user -> throw', () => {

            let test_id = "t_UH";

            chai.expect(() => {
                database.userAnalyzed(test_id, {
                    n_followers: 10,
                    n_following: 10,
                    n_posts: 10
                }, 0);
            }).to.throw

        });

        it('Follow Unknown user -> throw', () => {

            let test_id = "t_UI";

            chai.expect(() => {
                database.followedUser(test_id, {
                    n_followers: 10,
                    n_following: 10,
                    n_posts: 10
                }, 0);
            }).to.throw
        });

        it('Ask Follow Unknown user -> throw', () => {

            let test_id = "t_UI";

            chai.expect(() => {
                database.askedFollowUser(test_id, {
                    n_followers: 10,
                    n_following: 10,
                    n_posts: 10
                }, 0);
            }).to.throw
        });

        it('Add User & getState', async() => {

            let test_id = "t_UJ";

            database.addTargetAccount(`${test_id}_target`);

            let newEntry = database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            let userList = database.getUsers({username: test_id});

            assert(userList.length === 1 && database.getUserState(test_id) == Constants.INIT);
        });

        it('Get State of Unknown User -> throw', async() => {

            let test_id = "t_UK";

            chai.expect(() => {

                database.getUserState(test_id)
            }).to.throw;
        });

        it('Add User & Analyse with Bad Data', async() => {

            let test_id = "t_UL";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            chai.expect(() => {
                database.userAnalyzed(test_id, {}, 0);
            }).to.throw;
        });

        it('Find User To Analyse on Empty DB', async() => {

            let test_id = "t_UM";

            let user = database.findUserToAnalyse();

            assert(user == null)
        });

        it('Add user & Find User To Analyse', async() => {

            let test_id = "t_UN";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            let user = database.findUserToAnalyse();

            assert(user != null && user.state == Constants.INIT && user.username == test_id);
        });

        it('Add User & ignore', () => {

            let test_id = "t_UO";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.ignoredUser(test_id)

            let userList = database.getUsers({username: test_id});

            assert(userList.length === 1 && userList[0].state === Constants.IGNORED);
        });

        it('Ignore unknown User --> throw', () => {

            let test_id = "t_UO1";

            chai.expect(()=>{

                database.ignoredUser(test_id)
            }).to.throw;

        });

        it('Add User & analyse & follow & unfollow', () => {

            let test_id = "t_UP";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.userAnalyzed(test_id, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            database.followedUser(test_id);
            database.unfollowedUser(test_id);

            let userList = database.getUsers({username: test_id});

            assert(
                userList.length === 1 &&
                userList[0].state === Constants.UNFOLLOWED &&
                userList[0].unfollowed_dt > Date.now() - 1000 * 10
            );
        });

        it('Add User & analyse & askfollow & unfollow', () => {

            let test_id = "t_UQ";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.userAnalyzed(test_id, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            database.askedFollowUser(test_id);
            database.unfollowedUser(test_id);

            let userList = database.getUsers({username: test_id});

            assert(userList.length === 1 && userList[0].state === Constants.UNFOLLOWED && userList[0].unfollowed_dt > Date.now() - 1000 * 10);
        });

        it('Ask follow not analyzed User -> throw', () => {

            let test_id = "t_UR";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            chai.expect(() => {

                database.askedFollowUser(test_id);
            }).to.throw;
        });

        it('Follow not analyzed User -> throw', () => {

            let test_id = "t_US";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            chai.expect(() => {

                database.followUser(test_id);
            }).to.throw;
        });

        it('Unfollow notfollowed User -> throw', () => {

            let test_id = "t_US1";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.userAnalyzed(test_id, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 1)

            chai.expect(() => {

                database.unfollowedUser(test_id);
            }).to.throw;
        });

        it('Add User & follow_back', () => {

            let test_id = "t_UT";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: `${test_id}1`
                }
            ], `${test_id}_target`);
            database.addUsers([
                {
                    username: `${test_id}2`
                }
            ], `${test_id}_target`);

            database.userAnalyzed(`${test_id}2`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 1)
            database.updateFollowBackUsers([`${test_id}1`, `${test_id}2`])

            let userList1 = database.getUsers({username: `${test_id}1`});
            let userList2 = database.getUsers({username: `${test_id}2`});

            assert(userList1.length === 1 && userList1[0].follow_back && userList1[0].follow_back_dt > Date.now() - 1000 * 10 && userList2.length === 1 && userList2[0].follow_back && userList2[0].follow_back_dt > Date.now() - 1000 * 10);
        });

        it('getUsersFollowedBefore 1 day before', () => {

            let test_id = "t_UU";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.userAnalyzed(test_id, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 1);
            database.followedUser(test_id);

            // Manual update in DB to fake follow date.
            let user_collection = database
                .db
                .getCollection("users");
            let user = user_collection.findOne({username: test_id});
            user.followed_dt = Date.now() - 2 * 24 * 60 * 60 * 1000;
            user_collection.update(user);

            let userList = database.getUsersFollowedBefore(24);

            assert.equal(1, userList.length);
        });

        it('getUsersFollowedBefore 1 day before empty', () => {

            let test_id = "t_UV";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([
                {
                    username: test_id
                }
            ], `${test_id}_target`);

            database.userAnalyzed(test_id, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 1);
            database.followedUser(test_id);

            let userList = database.getUsersFollowedBefore(24);

            assert.equal(0, userList.length);
        });

        it('Get Best User From Score', async () => {

            let test_id = "t_UW";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([{
                username: `${test_id}1`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 10);

            database.addUsers([{
                username: `${test_id}2`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}2`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 100);

            database.addUsers([{
                username: `${test_id}3`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            let bestUser = database.findBestAnalyzedUser();

            assert.equal(100, bestUser.score);
        });

        it('Get user followed since 1h', async () => {
            
            let user_collection = database
                .db
                .getCollection("users");

            let test_id = "t_UX1";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([{
                username: `${test_id}1`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            database.followedUser(`${test_id}1`)

            database.addUsers([{
                username: `${test_id}2`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}2`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            database.followedUser(`${test_id}2`);

            // Manual update in DB to fake follow date.

            let user = user_collection.findOne({username: `${test_id}2`});

            user.followed_dt = Date.now() - 2 * 60 * 60 * 1000;

            user_collection.update(user);

            assert.equal( 1, database.numUserFollowedSince(1) )
        })

        it('Get user followed since 24h', async () => {

            let test_id = "t_UX2";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([{
                username: `${test_id}1`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            database.followedUser(`${test_id}1`)

            database.addUsers([{
                username: `${test_id}2`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}2`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            database.followedUser(`${test_id}2`);
            // Manual update in DB to fake follow date.

            let user_collection = database.db
                .getCollection("users");

            let user = user_collection.findOne({username: `${test_id}2`});

            user.followed_dt = Date.now() - 2 * 60 * 60 * 1000;
            user_collection.update(user);


            database.addUsers([{
                username: `${test_id}3`
            }], `${test_id}_target`);
            database.userAnalyzed(`${test_id}3`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);
            database.followedUser(`${test_id}3`);
            // Manual update in DB to fake follow date.
            user = user_collection.findOne({username: `${test_id}3`});
            user.followed_dt = Date.now() - 2* 24 * 60 * 60 * 1000;
            user_collection.update(user);

            assert.equal( 2, database.numUserFollowedSince(24) )
        })

        it('Get user unfollowed since 1h', async () => {

            let test_id = "t_UY1";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([{
                username: `${test_id}1`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            database.followedUser(`${test_id}1`);
            database.unfollowedUser(`${test_id}1`);

            database.addUsers([{
                username: `${test_id}2`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}2`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            database.followedUser(`${test_id}2`);
            database.unfollowedUser(`${test_id}1`);

            // Manual update in DB to fake follow date.
            let user_collection = database.db
                .getCollection("users");

            let user = user_collection.findOne({username: `${test_id}2`});

            user.unfollowed_dt = Date.now() - 2 * 60 * 60 * 1000;

            user_collection.update(user);

            assert.equal( 1, database.numUserUnfollowedSince(1) )
        })

        it('Get user unfollowed since 24h', async () => {

            let user_collection = database.db
                .getCollection("users");

            let test_id = "t_UY2";

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([{
                username: `${test_id}1`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            database.followedUser(`${test_id}1`);

            database.unfollowedUser(`${test_id}1`);

            database.addUsers([{
                username: `${test_id}2`
            }], `${test_id}_target`);

            database.userAnalyzed(`${test_id}2`, {
                n_followers: 1,
                n_following: 1,
                n_posts: 1
            }, 50);

            database.followedUser(`${test_id}2`);

            database.unfollowedUser(`${test_id}2`);

            // Manual update in DB to fake follow date.

            let user = user_collection
                .findOne({ username: `${test_id}2` });

            user.unfollowed_dt = Date.now() - 2 * 60 * 60 * 1000;
            user_collection.update( user );

            database
                .addUsers([{ username: `${test_id}3` }], `${test_id}_target`);

            database
                .userAnalyzed(`${test_id}3`, {
                    n_followers: 1,
                    n_following: 1,
                    n_posts: 1
                }, 50);

            database.followedUser(`${test_id}3`);

            database.unfollowedUser(`${test_id}3`);

            // Manual update in DB to fake follow date.
            user = user_collection.findOne({username: `${test_id}3`});

            user.unfollowed_dt = Date.now() - 2* 24 * 60 * 60 * 1000;

            user_collection.update(user);

            assert.equal( 2, database.numUserUnfollowedSince(24) )
        })

        it('Add legacy users', async () => {

            let test_id = "t_UZ1";

            let user_collection = database.db
                .getCollection("users");

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            },{
                username:`${test_id}3`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            assert.equal( 3,
                user_collection
                .find({ legacy: true, block_unfollow: true })
                .length
            );
        });
        // todo   Add legacy users already in db
        it('Add legacy already known users -> INIT', async () => {

            let test_id = "t_UZ1_A";

            let user_collection = database.db
                .getCollection("users");

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([ { username: `${test_id}1` } ], `${test_id}_target`);
            database.addUsers([ { username: `${test_id}2` } ], `${test_id}_target`);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            },{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: false,
                profile_pic_url:""
            }]);

            assert( 
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .state == Constants.ASK_FOLLOW
                &&
                user_collection
                .findOne({ username: `${test_id}2` })
                .state == Constants.FOLLOWED
                &&
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .legacy == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .legacy == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .block_unfollow == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .block_unfollow == true
            );
        });

        it('Add legacy already known users -> ANALIZED', async () => {

            let test_id = "t_UZ1_B";

            let user_collection = database.db
                .getCollection("users");

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([ { username: `${test_id}1` } ], `${test_id}_target`);
            database.addUsers([ { username: `${test_id}2` } ], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);
            
            database.userAnalyzed(`${test_id}2`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            },{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: false,
                profile_pic_url:""
            }]);

            assert( 
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .state == Constants.ASK_FOLLOW
                &&
                user_collection
                .findOne({ username: `${test_id}2` })
                .state == Constants.FOLLOWED
                &&
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .legacy == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .legacy == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .block_unfollow == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .block_unfollow == true
            );
        });

        it('Add legacy already known users -> ASK_FOLLOW', async () => {

            let test_id = "t_UZ1_C";

            let user_collection = database.db
                .getCollection("users");

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([ { username: `${test_id}1` } ], `${test_id}_target`);
            database.addUsers([ { username: `${test_id}2` } ], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);
            
            database.userAnalyzed(`${test_id}2`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            
            database.askedFollowUser(`${test_id}1`);
            database.askedFollowUser(`${test_id}2`);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            },{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: false,
                profile_pic_url:""
            }]);

            assert( 
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .state == Constants.ASK_FOLLOW
                &&
                user_collection
                .findOne({ username: `${test_id}2` })
                .state == Constants.ASK_FOLLOW
            );
        });

        it('Add legacy already known users -> FOLLOWER', async () => {

            let test_id = "t_UZ1_D";

            let user_collection = database.db
                .getCollection("users");

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([ { username: `${test_id}1` } ], `${test_id}_target`);
            database.addUsers([ { username: `${test_id}2` } ], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);
            
            database.userAnalyzed(`${test_id}2`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);
            
            database.followedUser(`${test_id}1`);
            database.followedUser(`${test_id}2`);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            },{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: false,
                profile_pic_url:""
            }]);

            assert( 
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .state == Constants.FOLLOWED
                &&
                user_collection
                .findOne({ username: `${test_id}2` })
                .state == Constants.FOLLOWED
            );
        });

        it('Add legacy already known users -> UNFOLLOWED', async () => {

            let test_id = "t_UZ1_E";

            let user_collection = database.db
                .getCollection("users");

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([ { username: `${test_id}1` } ], `${test_id}_target`);
            database.addUsers([ { username: `${test_id}2` } ], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);
            
            database.userAnalyzed(`${test_id}2`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            
            database.followedUser( `${test_id}1` );
            database.followedUser( `${test_id}2` );

            database.unfollowedUser( `${test_id}1` );
            database.unfollowedUser( `${test_id}2` );

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            },{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: false,
                profile_pic_url:""
            }]);

            assert( 
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .state == Constants.ASK_FOLLOW
                &&
                user_collection
                .findOne({ username: `${test_id}2` })
                .state == Constants.FOLLOWED
                &&
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .legacy == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .legacy == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .block_unfollow == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .block_unfollow == true
            );
        });

        it('Add legacy already known users -> IGNORED', async () => {

            let test_id = "t_UZ1_F";

            let user_collection = database.db
                .getCollection("users");

            database.addTargetAccount(`${test_id}_target`);

            database.addUsers([ { username: `${test_id}1` } ], `${test_id}_target`);
            database.addUsers([ { username: `${test_id}2` } ], `${test_id}_target`);

            database.userAnalyzed(`${test_id}1`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);
            
            database.userAnalyzed(`${test_id}2`, {
                n_followers: 10,
                n_following: 10,
                n_posts: 10
            }, 0);

            database.ignoredUser(`${test_id}1`);
            database.ignoredUser(`${test_id}2`);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            },{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: false,
                profile_pic_url:""
            }]);

            assert( 
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .state == Constants.ASK_FOLLOW
                &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .state == Constants.FOLLOWED
                &&
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .legacy == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .legacy == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}1` })
                    .block_unfollow == true
                    &&
                user_collection
                    .findOne({ username: `${test_id}2` })
                    .block_unfollow == true
            );
        });


        it('Unblock Legacy users', async () => {

            let test_id = "t_UZ2";

            let user_collection = database.db
                .getCollection("users");

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}3`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.unBlockLastLegacyUsers( 1 );

            assert( 
                user_collection
                    .find({ legacy: true, block_unfollow: true })
                    .length == 1
                &&
                user_collection
                    .find({ legacy: true, block_unfollow: false })
                    .length == 2
            );
        });

        it('Try to unblock Legacy users under keep variable', async () => {

            let test_id = "t_UZ2";

            let user_collection = database.db
                .getCollection("users");

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}3`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.unBlockLastLegacyUsers( 3 );

            assert( 
                user_collection
                    .find({ legacy: true, block_unfollow: true })
                    .length == 3
                &&
                user_collection
                    .find({ legacy: true, block_unfollow: false })
                    .length == 0
            );
        });

        it('Unblock all Legacy users ', async () => {

            let test_id = "t_UZ2";

            let user_collection = database
                .db
                .getCollection("users");

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}1`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}2`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}3`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}4`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.updateAlreadyFollowedUsers([{
                username:`${test_id}5`,
                followed_by_viewer:true,
                requested_by_viewer: true,
                profile_pic_url:""
            }]);

            database.unBlockLastLegacyUsers( 0 );

            assert(
                user_collection
                    .find({ legacy: true, block_unfollow: true })
                    .length == 0
                &&
                user_collection
                    .find({ legacy: true, block_unfollow: false })
                    .length == 5
            );
        });
    });
    
    describe('Targets', () => {

        beforeEach(() => {
            database.removeTargets();
        });

        it('Get Targets', async () => {
            assert(Array.isArray(database.getTargets()))
        });

        it('Add Target Account', async () => {

            database.addTargetAccount("TARGET1");

            assert.equal(1, (database.getTargets().filter(e => e.username === "TARGET1")).length)
        });

        it('Add Target Account That Already Exists', async () => {

            database.addTargetAccount("TARGET2");

            chai.expect(() => {
                database.addTargetAccount("TARGET2");
            }).to.throw();
        });

        it('Update Scanned Unknown Target Account', async () => {

            chai.expect(() => {
                database.scannedTargetAccount("B")
            }).to.throw();
        })

        it('Update Scanned Target Account', async () => {

            database.addTargetAccount("C");

            let n_last_target = (database.getTargets({
                last_scan_day: 1
            })).length;

            database.scannedTargetAccount("C");

            let n_last_target_after = (database.getTargets({
                last_scan_day: 1
            })).length;

            assert.equal(n_last_target_after, n_last_target - 1)
        });

        it('Add and Remove Target Account', async () => {

            let test_id = "t_TE";
            database.addTargetAccount(test_id);

            let afterAdd = (database.getTargets()).filter(e => e.username == test_id).length;

            database.removeTargetAccount(test_id);

            let afterRemove = (database.getTargets()).filter(e => e.username == test_id).length;

            assert.equal(afterRemove, afterAdd - 1);
        });

        it('Enable / Disable Target Account', async () => {

            let test_id = "t_TF";

            database.addTargetAccount( test_id );
            let enableA = (database.getTargets()).filter(e => e.username == test_id)[0].enable;

            database.enableTargetAccount( test_id );
            let enableB = (database.getTargets()).filter(e => e.username == test_id)[0].enable;

            database.disableTargetAccount( test_id );
            let enableC = (database.getTargets()).filter(e => e.username == test_id)[0].enable;

            assert( enableA && enableB && !enableC )

        });
        
        it('Add Target Hashtag', async () => {

            let test_id = "t_ThashA";
            database.addTargetHashtag(test_id);

            assert.equal(1, (database.getTargets().filter(e => e.hashtag === test_id)).length)
        });

        it('Add Target Hashtag That Already Exists', async () => {

            let test_id = "t_ThashB";

            database.addTargetHashtag(test_id);

            chai.expect(() => {
                database.addTargetHashtag(test_id);
            }).to.throw();
        });

        it('Update Scanned Unknown Target Hashtag', async () => {

            let test_id = "t_ThashC";

            chai.expect(() => {
                database.scannedTargetHashtag(test_id)
            }).to.throw();
        })

        it('Update Scanned Target Hashtag', async () => {

            let test_id = "t_ThashD";

            database.addTargetHashtag(test_id);

            let n_last_target = (database.getTargets({
                last_scan_day: 1
            })).length;

            database.scannedTargetHashtag(test_id);

            let n_last_target_after = (database.getTargets({
                last_scan_day: 1
            })).length;

            assert.equal(n_last_target_after, n_last_target - 1)
        });

        it('Add and Remove Target Hashtag', async () => {

            let test_id = "t_ThashE";

            database.addTargetHashtag(test_id);
            let afterAdd = (database.getTargets()).filter(e => e.hashtag == test_id).length;

            database.removeTargetHashtag( test_id );

            let afterRemove = (database.getTargets()).filter(e => e.hashtag == test_id).length;

            assert.equal(afterRemove, afterAdd - 1);
        });

        it('Enable / Disable Target Hashtag', async () => {

            let test_id = "t_ThashF";

            database.addTargetHashtag( test_id );
            let enableA = (database.getTargets()).filter(e => e.hashtag == test_id)[0].enable;

            database.enableTargetHashtag( test_id );
            let enableB = (database.getTargets()).filter(e => e.hashtag == test_id)[0].enable;

            database.disableTargetHashtag( test_id );
            let enableC = (database.getTargets()).filter(e => e.hashtag == test_id)[0].enable;

            assert( enableA && enableB && !enableC )

        });

    });

    describe('Flash', async () => {

        before(() => {
            it('Get Last flash when no flash exists', () => {

                let lastFlashDt = database.getLastFlashDate();
                assert.equal(lastFlashDt, 0);
            })
        })

        it('Add & Get Last 12h Flashs', () => {

            database.addFlash({
                n_followers: 0,
                dt: Date.now() - 24 * 60 * 60 * 1000
            });
            database.addFlash({
                n_followers: 1000,
                dt: Date.now() - 4 * 60 * 60 * 1000
            });
            database.addFlash({
                n_followers: 2000,
                dt: Date.now() - 3 * 60 * 60 * 1000
            });
            database.addFlash({
                n_followers: 3000,
                dt: Date.now() - 2 * 60 * 60 * 1000
            });
            database.addFlash({
                n_followers: 4000,
                dt: Date.now() - 1 * 60 * 60 * 1000
            });

            let flashs = database.getLastFlashs(12);

            assert.equal(flashs.length, 4);
        });

        it('Get Last Flash Date', () => {

            let dt = Date.now();

            database.addFlash({ n_followers: 4000, dt });

            let lastFlashDt = database.getLastFlashDate();

            assert.equal(lastFlashDt, dt);
        })
    });
});