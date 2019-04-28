import React, { Component } from 'react';

import { connect } from 'react-redux';

import Header from '../Header/Header';

import Tile from '../Tile/Tile';

import './Dashboard.css';

class Dashboard extends Component {

    constructor( props ){
        super( props );

        this.state = {
            scanner_run:false,
            follower_run: false,
            stats:null,
            details:false,
            keepLastFollowing:200,
            logs:[]
        }

        this.loadParams = this.loadParams.bind(this);
        this.loadStats = this.loadStats.bind(this);
        this.loadLogs = this.loadLogs.bind(this);

        this.stopScanner = this.stopScanner.bind(this);
        this.startScanner = this.startScanner.bind(this);

        this.stopFollower = this.stopFollower.bind(this);
        this.startFollower = this.startFollower.bind(this);

        this.startBot = this.startBot.bind(this);
        this.stopBot = this.stopBot.bind(this);

        this.authoriseLegacyUnfollow = this.authoriseLegacyUnfollow.bind(this);
    }

    authoriseLegacyUnfollow(){

        return fetch( this.props.reducer.server+"unblocklegacyusers",{
            method:"POST",
            body:JSON.stringify( {n_keep:this.state.keepLastFollowing} ),
            headers:new Headers({
              "Content-Type": "application/json"
            })
          });
    }

    componentWillUnmount = () => {

        if( this.interval )
            clearInterval( this.interval )
    }
    
    componentWillMount(){
        
        this.loadParams();
        this.loadStats();
        this.loadLogs();

        this.interval = setInterval(()=>{
            this.loadStats();
            this.loadParams();
            this.loadLogs();
        },5000);
    }

    loadParams(){

        fetch( this.props.reducer.server+"/params" )
        .then( response => response.json() )
        .then( data=>{

            this.setState({
                scanner_run:data.params.scanner.started,
                follower_run:data.params.follower.started,
                instagram:data.params.instagram,
                mainAccount: data.mainAccount,
                otherAccounts: data.otherAccounts
            });
        });
    }

    loadLogs(){

        fetch( this.props.reducer.server+"/logs" )
        .then( response => response.json() )
        .then( logs=>{

            logs.reverse();

            this.setState({logs});
        });
    }

    loadStats(){

        fetch( this.props.reducer.server+"/stats" )
        .then( response => response.json() )
        .then( stats=>{

            this.setState({stats});

        });
    }

    startBot(){
        Promise.all([
            this.startFollower(),
            this.startScanner()
        ]).then(()=>{
            this.loadParams();
        });
    }

    stopBot(){
        Promise.all([
            this.stopFollower(),
            this.stopScanner()
        ]).then(()=>{
            this.loadParams();
        });
    }

    stopScanner(){

        return fetch( this.props.reducer.server+"scanner",{
            method:"PATCH",
            body:JSON.stringify( {start:false} ),
            headers:new Headers({
              "Content-Type": "application/json"
            })
          });
    }
    startScanner(){

        return fetch( this.props.reducer.server+"scanner",{
            method:"PATCH",
            body:JSON.stringify( {start:true} ),
            headers:new Headers({
              "Content-Type": "application/json"
            })
          });
    }

    stopFollower(){

        return fetch( this.props.reducer.server+"follower",{
            method:"PATCH",
            body:JSON.stringify( {start:false} ),
            headers:new Headers({
              "Content-Type": "application/json"
            })
          });
    }

    startFollower(){

        return fetch( this.props.reducer.server+"follower",{
            method:"PATCH",
            body:JSON.stringify( {start:true} ),
            headers:new Headers({
              "Content-Type": "application/json"
            })
        });
    }

    render() {

        let n_followers = this.state.stats ? this.state.stats.n_followers : 0;
        let n_followings = this.state.stats ? this.state.stats.n_followings : 0;

        let new_n_followers = this.state.stats ? this.state.stats.n_new_followers : 0;
        
        return ([
            
            <Header key="header"/>,
            <div className="Dashboard" key="content">

                {this.state.stats && this.state.instagram &&
                <div className="row">


                    <Tile size="lg" textAlign="center">

                    <small className="gray">Cliquer pour {this.state.follower_run?"éteindre":"allumer"}</small>

                    <div
                        className={`accountProfileImg ${this.state.follower_run?"started":"stopped"}`}
                        onClick={this.state.follower_run?this.stopBot:this.startBot}>

                        <img src={`${this.props.reducer.server}../data/profile_images/${this.state.mainAccount}.jpg`} className="logoPreview" alt="instagram profile" />
                        <i className={`fas fa-cog fa-spin`}></i>
                    </div>

                    <div>
                        <a href={`https://www.instagram.com/${this.state.mainAccount}`} target="_blank">
                            <i className="fas fa-external-link-alt" style={{fontSize:12}}></i>
                            {' '}
                            {this.state.mainAccount}</a>
                    </div>

                    <div className="generalSituation">
                        {
                            this.state.instagram.blocking.login.main.error?
                            <div className="alert alert-danger" role="alert">
                                Le compte principal est bloqué
                            </div>
                            :this.state.instagram.blocking.follow.blocked?
                            <div className="alert alert-danger" role="alert">
                                Impossible de follow pour le moment : les requêtes sont bloquées.
                            </div>
                            :this.state.instagram.blocking.unfollow.blocked?
                            <div className="alert alert-danger" role="alert">
                                Impossible de unfollow pour le moment : les requêtes sont bloquées.
                            </div>
                            :this.state.instagram.blocking.login.others[0].error?
                            <div className="alert alert-danger" role="alert">
                                Le compte secondaire est bloqué
                            </div>
                            :this.state.stats.total_legacy_blocked_followings >= 2500 ?
                            <div className="alert alert-danger" role="alert">
                                Il y a {this.state.stats.total_legacy_blocked_followings} utilisateurs suivis en dehors du robot.
                                Au dela de 2500, le robot ne plus plus fonctionner.
                                <div>
                                Je veux garder les <input type="number" value={this.state.keepLastFollowing} onChange={(e)=>{
                                    this.setState({keepLastFollowing:parseInt(`${e.target.value}`.replace(/[^0-9]/g,""), 10)})
                                }} min={0} max={2000}/> premiers followings.
                                </div>
                                <button className="btn" onClick={this.authoriseLegacyUnfollow}>Autoriser l'unfollow de ces utilisateurs</button>
                            </div>
                            :this.state.stats.total_legacy_blocked_followings > 1000 ?
                            <div className="alert alert-warning" role="alert">
                                Il y a {this.state.stats.total_legacy_blocked_followings} utilisateurs suivis en dehors du robot.
                                Ces utilisateurs ne seront pas unfollow. Nous vous conseillons d'avoir moins de 1000 followings qui ne peuvent pas etre unfollow.
                                {' '}
                                <div>
                                Je veux garder les <input type="number" value={this.state.keepLastFollowing} onChange={(e)=>{
                                    this.setState({keepLastFollowing:parseInt(`${e.target.value}`.replace(/[^0-9]/g,""), 10)})
                                }} min={0} max={2000}/> premiers followings.
                                </div>
                                <button className="btn" onClick={this.authoriseLegacyUnfollow}>Autoriser l'unfollow de ces utilisateurs</button>
                            </div>
                            :<div className="alert alert-success" role="alert">
                                Le robot fonctionne sans problème.
                            </div>
                        }

                    </div>

                        <div className="profileInfo row">
                            <div className="info col-xl-6">
                                <strong>{n_followers}</strong>
                                {' '}
                                <small>followers (+{new_n_followers} aujourd'hui)</small>
                            </div>
                            <div className="info col-xl-6">
                                <strong>{n_followings}</strong>
                                {' '}
                                <small>
                                    following (+{this.state.stats.followed_today} aujourd'hui)
                                </small>
                            </div>
                        </div>
                        
                        <div>
                            <small className="moreButton gray" onClick={()=>{this.setState({details:!this.state.details})}}>
                                {this.state.details?<div key={1}>
                                    Voir moins <i className="fas fa-caret-up"></i>
                                </div>:<div key={2}>
                                    Voir plus <i className="fas fa-caret-down"></i>
                                </div>}
                            </small>

                            {this.state.details && <div className="profileInfo row">

                                <div className="info col-xl-6">
                                    <strong>{this.state.stats.init_count}</strong>
                                    {' '}
                                    <small>profiles en attente d'analyse</small>
                                </div>

                                <div className="info col-xl-6">
                                    <strong>{this.state.stats.total_analysed}</strong>
                                    {' '}
                                    <small>profiles analysés en attente de follow</small>
                                </div>

                                <div className="info col-xl-6">
                                    <strong>{this.state.stats.total_followed}</strong>
                                    {' '}
                                    <small>follow ({this.state.stats.followed_today} aujourd'hui)</small>
                                </div>

                                <div className="info col-xl-6">
                                    <strong>{this.state.stats.total_unfollowed}</strong>
                                    {' '}
                                    <small>unfollow ({this.state.stats.unfollowed_today} aujourd'hui)</small>
                                </div>

                                <div className="logs">
                                    { this.state.logs.map(e=><div>{e.type} => {e.username}</div>) }
                                </div>

                            </div>}
                            
                        </div>
                    </Tile>
                </div>
                }
            </div>
        ])
    }
}

export default connect(state => state)(Dashboard);
