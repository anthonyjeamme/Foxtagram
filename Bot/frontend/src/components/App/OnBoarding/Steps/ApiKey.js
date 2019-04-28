import React, {Component} from 'react';

import FillVertical from 'fillvertical';

import {connect} from 'react-redux';

let server = "https://foxtagram-ws.herokuapp.com/"

class ApiKey extends Component {

    constructor(props) {

        super(props);

        this.state = {
            key: "",
            error:false,
            notRegistered:false
        }

        this.isValidKey = this
            .isValidKey
            .bind(this)

        this.verifKey = this
            .verifKey
            .bind(this)

            
    }

    isValidKey(){

        return( (this.state.key.replace(/[^A-Z0-9]/g,'').length === 20 ))
    }

    saveKey( key ){
        
        return fetch(this.props.reducer.server + "/params/key/"+key, {
            method: "POST"
        })
        .then(d => d.json())
        .then((d) => {
            return d.success
        });
    }

    verifKey() {

        if( !this.isValidKey() ) return;

        
        fetch(server + "key/"+this.state.key, {
            method: "GET",
            headers: new Headers({"Content-Type": "application/json"})
            })
            .then(d => d.json())
            .then(async (d) => {

                if( d.active ){
                    
                    if( await this.saveKey( this.state.key ))
                        this.props.onNext();
                    else
                        alert('Erreur de connexion au serveur. Merci de contacter l\'équipe de Foxtagram');
                }

                else if( d.available ){
                    this.setState({
                        error:false,
                        notRegistered:true
                    })
                }

                else{
                    this.setState({error:true,
                        notRegistered:false})
                }
            });
    }

    render() {
        return (
            <FillVertical
                justifyContent="center"
                style={{
                textAlign: "center"
            }}>

                <div className="center container">

                    <h1 style={{
                        marginBottom: 30
                    }}>Clé d'activation</h1>

                    <p>
                        Actuellement Foxtagram est en version beta fermée.
                    </p>
                    <p>
                        Rendez-vous sur
                        {' '}
                        <a href="https://www.facebook.com/Foxtagram-413453812442447/" rel="noopener noreferrer" target="_blank">Notre page Facebook</a> 
                        {' '}
                        pour demander votre clé.
                    </p>

                    {this.state.notRegistered && <p className="alert alert-info">
                    Visitez <a href="http://www.foxtagram.herokuapp.com" rel="noopener noreferrer" target="_blank">notre site internet</a> pour activer votre clé.</p>}

                    {this.state.error && <p className="alert alert-danger">
                    Cette clé n'est pas valable.</p>}

                    <input
                        className="form-control"
                        value={this.state.key}
                        onChange={(e)=>{ this.setState({key:e.target.value.toUpperCase()}); }}
                        style={{margin:0, padding:20, fontSize:28, textAlign:"center"}}
                        maxLength={ 24 }
                        placeholder="Votre clé"/>

                    <hr/>
                    <div className="center">
                        <button
                            disabled={!this.isValidKey()}
                            className="big"
                            onClick={this.verifKey}>Vérifier ma clé</button>
                    </div>
                </div>

            </FillVertical>
        );
    }
}

export default connect(state => state)(ApiKey);