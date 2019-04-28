import React, { Component } from 'react';

import { connect } from 'react-redux';

class Spy extends Component {

  constructor(props){
    super(props);

    this.state = {
      spyList:[],
      addAccountInput:"",
      addAccountLoading:false
    }

    this.addAccount = this.addAccount.bind(this);
    this.checkInstagramUsernameExists = this.checkInstagramUsernameExists.bind(this);
    this.loadSpyList = this.loadSpyList.bind(this)
  }

  
  loadSpyList(){

    fetch( this.props.reducer.server+"/spy" )
    .then( response => response.json() )
    .then( data=>{

        this.setState({
          spyList:data.users
        })
    })
  }

  componentDidMount = () => {
    this.loadSpyList()
  }
  

  async addAccount(){

    this.setState({addAccountLoading:true});
    let username=this.state.addAccountInput;

    if( username==="" ) return;

    let exists = await this.checkInstagramUsernameExists( username );

    if( !exists ){
      this.setState({addAccountLoading:false});
      alert( "Ce compte n'existe pas" );
      return;
    }
    
    fetch( this.props.reducer.server+"/spy/"+username,{
      method:"POST",
      headers:new Headers({
        "Content-Type": "application/json"
      })
    })
    .then( d=>d.json())
    .then( (d)=>{

      if(d.success){

        this.setState({addAccountInput:""});
        this.loadSpyList();
      } else {
        alert( d.message )
      }
      this.setState({addAccountLoading:false});
    })
  }

  valideInstagramUsername( username ){

    if( username==="" || username.length > 30 ) return false;

    return username.match(/^[a-zA-Z0-9_.]*$/);
  }

  async checkInstagramUsernameExists( username ){

    return fetch( this.props.reducer.server+"checkaccount/"+username,{
      method:"GET",
      headers:new Headers({
        "Content-Type": "application/json"
      })
    })
    .then( d=>d.json())
    .then( (d)=>{

      if(d.success){

        return d.exists;
      } else {
      }
    });
  }

  beautifulDate(dt){

    if( dt===0 ) return <span className="small">Jamais</span>;
    
    let date = new Date(dt);

    let delay_m = (Date.now() - date.getTime())/(1000*60);

    let text = "";
    if( delay_m < 1 ) text = `Il y a moins d'une minute`;
    else if( delay_m < 60 ) text = `Il y a ${Math.round( delay_m )} minutes`;
    else if( delay_m/60 < 24 ) text = `Il y a ${Math.round(delay_m/60)} heures`;

    return text;
  }

  render() {

    return (
      <div className="container center" style={{marginTop:50}}>

          <h1 style={{
            marginBottom: 30
          }}>Comptes espionnés</h1>

          <p>
              Ce sont les comptes à qui le robot pique les followers.
          </p>
          <p>
              Ajoutez-en au moins 5
          </p>

        <div className="row">
          <div className="addSpy input-group">
            <input
              className="form-control"
              style={{margin:0}}
              id="accountNameToAdd"
              value={this.state.addAccountInput}
              onKeyPress={e=>{
                if( e.key === 'Enter' ){
                  this.addAccount();
                }
              }}
              onChange={e=>this.setState({addAccountInput:e.target.value.toLocaleLowerCase()})}
              placeholder="Nom du compte à ajouter"/>
            <button
              className="addSpyButton"
              disabled={!this.valideInstagramUsername(this.state.addAccountInput) || this.state.addAccountLoading}
              onClick={this.addAccount}

              style={{borderBottom:0}}
              >

              {
                this.state.addAccountLoading?
                  <span>Chargement...</span>
                  :
                  <span>Ajouter</span>
              }
            </button>
          </div>
        </div>

        <hr/>

      {this.state.spyList&&this.state.spyList.length===0&&<div className="noData">
        Aucun compte suivit
      </div>}
      
      {this.state.spyList&&this.state.spyList.length>0&&<div>

        <table className="table table-hover text-center">

        <thead>
          <tr>
            <th>Nom du compte</th>
          </tr>
        </thead>

        <tbody>

        {this.state.spyList.map(a=>(
          <tr className={a.enable?"table-success":""}>
            <td>
              <strong>{a.username}</strong>
            </td>
          </tr>
        ))}
      
        </tbody>

        </table>

      </div>}

        <hr/>
        <div className="center">
            <button className="big" disabled={this.state.spyList.length<5} onClick={this.props.onNext}>{this.state.spyList.length<5?"Ajoutez au moins 5 comptes":"Suivant"}</button>
        </div>
      </div>
    )
  }
}

export default connect(state => state)(Spy);
