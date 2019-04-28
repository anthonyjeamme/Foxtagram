import React, {Component} from 'react';
import {connect} from 'react-redux';

import Header from '../Header/Header';
import Schedule from './Schedule/Schedule';
import Tile from '../Tile/Tile';

import './Config.css';

class Config extends Component {

    constructor(props) {
        super(props);

        this.state = {
            scanner_run: null,
            follower_run: null,
            instagram: null,
            mainAccount: null,
            otherAccounts: null,
            formMainAccountPassword:"",
            formOtherAccountPassword:"",
        }

        this.loadParams = this
            .loadParams
            .bind(this);

        this.changeMainAccountPassword = this.changeMainAccountPassword.bind(this);
        this.changeOtherAccountPassword = this.changeOtherAccountPassword.bind(this);
    }

    componentDidMount = () => {
        this.loadParams();
    }

        
    changeMainAccountPassword() {

        let username = this.state.mainAccount;
        let password = this.state.formMainAccountPassword;

        fetch(this.props.reducer.server + "mainaccount", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body:JSON.stringify({
            username,
            password
            })
        })
        .then(d => d.json())
        .then((d) => {

            if (d.success) {

                window.location.reload(); // TODO change ?

            } else {
            alert(d.message)
            }
        });
    }


    changeOtherAccountPassword() {

        let username = this.state.otherAccounts[0];
        let password = this.state.formOtherAccountPassword;

        fetch(this.props.reducer.server + "otheraccount", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body:JSON.stringify({
            username,
            password
            })
        })
        .then(d => d.json())
        .then((d) => {

            if (d.success) {

                window.location.reload(); // TODO change ?

            } else {
            alert(d.message)
            }
        });
    }

    loadParams() {

        fetch(this.props.reducer.server + "/params")
            .then(response => response.json())
            .then(data => {

                this.setState({
                    scanner_run: data.params.scanner.started,
                    follower_run: data.params.follower.started,
                    instagram: data.params.instagram,
                    mainAccount: data.mainAccount,
                    otherAccounts: data.otherAccounts,
                    mainAccountError: data.params.instagram.blocking.login.main.error,
                    otherAccountError: data.params.instagram.blocking.login.others[0].error,
                })
            })
    }

    render() {
        return ([
        <Header key="Header"/>,
        <div className="Config" key="ConfigContent">

            <h1 className="center">Configuration</h1>

            <hr/>

            <div className="row">

                <Tile size="md">
                    <h2 className="center">Compte principale</h2>

                    {this.state.mainAccountError?
                    <div>

                    <p className="center alert alert-danger"><small>

                        Impossible de se connecter au compte principale. Soit vous avez changé le mot de passe, soit le compte est bloqué.
                        </small></p><p className="center"><small>

                        Après avoir changé de mot de passe, attendez environ 2 minutes et actualisez la page

                        </small></p>
                        </div>:
                    
                    <div>

                    <p className="center alert alert-success"><small>

                        Le compte principale n'a aucun problème.

                        </small></p>

                    <p className="center"><small>

                         Si des problèmes de connexion surviennent, vous pourrez modifier le mot de passe.

                    </small></p></div>}



                    <div className="TileContainer center">

                    <div className="input-group mb-3">
                        <div className="input-group-prepend">

                            <span className="input-group-text" id="basic-addon1">Nom d'utilisateur</span>
                        </div>

                        <input
                            type="text"
                            value={this.state.mainAccount||""}
                            readOnly
                            className="form-control"/>
                        </div>


                        {this.state.mainAccountError && <div>

                            <input
                                type="password"
                                placeholder="Mot de passe"
                                className="form-control"
                                value={this.state.formMainAccountPassword||""}
                                onChange={e=>{this.setState({formMainAccountPassword:e.target.value})}}
                                />

                            <hr/>

                            <button className="small" onClick={this.changeMainAccountPassword} disabled={this.state.formMainAccountPassword.length===0}>Changer le mot de passe</button>

                        </div>}
                    </div>


                </Tile>
                <Tile size="md">
                    <h2 className="center">Compte secondaire</h2>

                    {this.state.otherAccountError?
                    <div>

                    <p className="center alert alert-danger"><small>

                        Impossible de se connecter au compte secondaire. Soit vous avez changé le mot de passe, soit le compte est bloqué.
                        </small></p><p className="center"><small>

Après avoir changé de mot de passe, attendez environ 2 minutes et actualisez la page

</small></p>
                        </div>:
                    
                    <div>

                    <p className="center alert alert-success"><small>

                        Le compte secondaire n'a aucun problème.

                        </small></p>

                    <p className="center"><small>

                         Si des problèmes de connexion surviennent, vous pourrez modifier le mot de passe.

                    </small></p></div>}



                    <div className="TileContainer center">

                    <div className="input-group mb-3">
                        <div className="input-group-prepend">

                            <span className="input-group-text" id="basic-addon1">Nom d'utilisateur</span>
                        </div>

                        <input
                            type="text"
                            value={this.state.otherAccounts||""}
                            readOnly
                            className="form-control"/>
                        </div>


                        {this.state.otherAccountError && <div>

                            <input
                                type="password"
                                placeholder="Mot de passe"
                                className="form-control"
                                value={this.state.formOtherAccountPassword||""}
                                onChange={e=>{this.setState({formOtherAccountPassword:e.target.value})}}
                                />

                            <hr/>

                            <button className="small" onClick={this.changeOtherAccountPassword} disabled={this.state.formOtherAccountPassword.length===0}>Changer le mot de passe</button>

                        </div>}
                    </div>

                </Tile>

            </div>

            <Schedule/>

        </div>
        ])
    }
}

export default connect(state => state)(Config);
