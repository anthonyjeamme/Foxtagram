import React, { Component } from 'react';

import { connect } from 'react-redux';

import Header from '../Header/Header';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

class Spy extends Component {

  constructor(props){
    super(props);

    this.state = {
      spyList:null,
      addSpyInput:"",
      addAccountLoading:false
    }

    this.loadSpyList = this.loadSpyList.bind( this );
    this.addAccount = this.addAccount.bind( this );
    this.removeSpyAccount = this.removeSpyAccount.bind( this );
    this.removeSpyHashtag = this.removeSpyHashtag.bind( this );
    this.checkInstagramUsernameExists = this.checkInstagramUsernameExists.bind( this );
    this.enableSpyAccount = this.enableSpyAccount.bind( this );
    this.enableSpyHashtag = this.enableSpyHashtag.bind( this );
    this.disableSpyAccount = this.disableSpyAccount.bind( this );
    this.disableSpyHashtag = this.disableSpyHashtag.bind( this );
  }

  componentWillMount(){
    this.loadSpyList();

    this.refreshInterval = setInterval(()=>{
      this.loadSpyList();
    },5000);
  }

  componentWillUnmount = () => {
    clearInterval( this.refreshInterval );
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

  disableSpyAccount( username ){
    
    fetch( this.props.reducer.server+"/spy/accounts/"+username,{
      method:"PATCH",
      body:JSON.stringify( {enable:false} ),
      headers:new Headers({
        "Content-Type": "application/json"
      })
    
    })
    .then( ()=>{

      this.loadSpyList();
    })
  }
  disableSpyHashtag( hashtag ){
    
    fetch( this.props.reducer.server+"/spy/hashtags/"+encodeURIComponent(hashtag),{
      method:"PATCH",
      body:JSON.stringify( {enable:false} ),
      headers:new Headers({
        "Content-Type": "application/json"
      })
    
    })
    .then( ()=>{

      this.loadSpyList();
    })
  }

  enableSpyAccount( username ){
    
    fetch( this.props.reducer.server+"/spy/accounts/"+username,{
      method:"PATCH",
      body:JSON.stringify( {enable:true} ),
      headers:new Headers({
        "Content-Type": "application/json"
      })
    
    })
    .then( ()=>{

      this.loadSpyList();
    })
  }

  enableSpyHashtag( hashtag ){
    
    fetch( this.props.reducer.server+"/spy/hashtags/"+encodeURIComponent(hashtag),{
      method:"PATCH",
      body:JSON.stringify( {enable:true} ),
      headers:new Headers({
        "Content-Type": "application/json"
      })
    
    })
    .then( ()=>{
      this.loadSpyList();
    })
  }

  async sendNewSpyAccount( username ){

    if( !await this.checkInstagramUsernameExists( username ) ){
      this.setState({addAccountLoading:false});
      alert( "Ce compte n'existe pas" );
      return;
    }

    let url = this.props.reducer.server + "spy/accounts/" + username;

    return fetch( url, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" })
    })
    .then( d => d.json() )
    .then( d => {

      if( d.success ){

        this.setState({addSpyInput:""});
        this.loadSpyList();
      } else {

        alert( d.message );
      }
    });
  }

  async sendNewSpyHashtag( hashtag ){

    let url = this.props.reducer.server + "spy/hashtags/" + encodeURIComponent( hashtag );

    return fetch( url, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" })
    })
    .then( d => d.json() )
    .then( d => {

      if( d.success ){

        this.setState({ addSpyInput: "" });
        this.loadSpyList();
      } else {

        alert( d.message );
      }
    });
  }

  async addAccount(){

    const { addSpyInput } = this.state;
    const stopLoading = ()=>this.setState({ addAccountLoading: false });
    this.setState({ addAccountLoading: true });
    
    if( this.valideInstagramUsername( addSpyInput ) ){

      this.sendNewSpyAccount( addSpyInput ).then( stopLoading ).catch( stopLoading );

    } else if( this.valideInstagramHashtag( addSpyInput ) ){
      
      this.sendNewSpyHashtag( addSpyInput ).then( stopLoading ).catch( stopLoading );
    }
  }

  removeSpyAccount( username ){

    confirmAlert({
      title: '',
      message: `Voulez-vous vraiment supprimer ${username} ?`, 
      childrenElement: () => <small>Cette action est irréversible</small>, 
      confirmLabel: 'Oui',
      cancelLabel: 'Annuler',
      onConfirm: () => {
            
        fetch( this.props.reducer.server+"/spy/accounts/"+username,{
          method:"DELETE",
          headers:new Headers({
            "Content-Type": "application/json"
          })
        })
        .then( d=>d.json())
        .then( (d)=>{

          if(d.success){

            this.loadSpyList();
          } else {
            alert( d.message )
          }
        })
      },
      onCancel: () => {}
    });
  }
  removeSpyHashtag( hashtag ){

    confirmAlert({
      title: '',
      message: `Voulez-vous vraiment supprimer ${hashtag} ?`, 
      childrenElement: () => <small>Cette action est irréversible</small>, 
      confirmLabel: 'Oui',
      cancelLabel: 'Annuler',
      onConfirm: () => {
            
        fetch( this.props.reducer.server+"/spy/hashtags/"+encodeURIComponent(hashtag),{
          method:"DELETE",
          headers:new Headers({
            "Content-Type": "application/json"
          })
        })
        .then( d=>d.json())
        .then( (d)=>{

          if(d.success){

            this.loadSpyList();
          } else {
            alert( d.message )
          }
        })
      },
      onCancel: () => {}
    });
  }

  valideInstagramUsername( username ){

    if( username==="" || username.length > 30 ) return false;

    return username.match(/^[a-zA-Z0-9_.]*$/);
  }

  valideInstagramHashtag( string ){

    if(! this.isHashTag( string )) return false;

    if( string.length < 2 ) return false;

    return true;
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

  isHashTag( string ){

    return (
      string.length > 0 &&
      string[0] === "#"
    );
  }

  render() {

    return ([
      <Header key="Header"/>,
      <div className="container" key="Container">
        <div className="row">
          <div className="col-md-6 offset-md-6">
          <div className="addSpy input-group">
          
            <div className="input-group-prepend">
              <div className="input-group-text">

                {
                  this.isHashTag( this.state.addSpyInput )?<span key="A"><i className="fas fa-hashtag"></i></span>:<span key="B"><i className="fas fa-user"></i></span>
                }
                  
              </div>
            </div>
            <input
              className="form-control form-control"
              id="accountNameToAdd"
              value={this.state.addSpyInput}
              onKeyPress={e=>{
                if( e.key === 'Enter' ){
                  this.addAccount();
                }
              }}
              style={{margin:0}}
              onChange={e=>this.setState({addSpyInput:e.target.value.toLocaleLowerCase().replace(' ','')})}
              placeholder="Nom du compte ou #"/>
            <button
              className="addSpyButton"
              disabled={(
                !this.valideInstagramUsername(this.state.addSpyInput) &&
                !this.valideInstagramHashtag(this.state.addSpyInput)
              ) || this.state.addAccountLoading}
              onClick={this.addAccount}
              >

              {
                this.state.addAccountLoading?
                  <div>Chargement</div>
                  :
                  <span>Ajouter {this.isHashTag( this.state.addSpyInput )?"le hashtag":"l'utilisateur"}</span>
              }
            </button>
          </div>
          </div>
        </div>

        <hr/>

          {
            this.state.spyList&&this.state.spyList.length<15&&[
            <p key="A" className="alert alert-warning text-center  alert-dismissible fade show">
              Nous vous conseillons d'ajouter au moins 15 pages pour un fonctionnement optimale du robot.
            </p>,
            <hr key="B"/>
            ]
          }

          <p className="alert alert-info text-center">
              Note: les ratios apparaissent 2 jours après les follow.
          </p>

      {this.state.spyList&&this.state.spyList.length===0&&<div className="noData">
        Aucun compte suivit
      </div>}
      
      {this.state.spyList&&this.state.spyList.length>0&&<div className="table-responsive">
        <table className="table table-hover text-center">

        <thead>
          <tr>
            <th></th>
            <th>Nom du compte</th>
            <th>Nombre de follow</th>
            <th>Derniere extraction</th>
            <th>Ratio</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

        {this.state.spyList.map((a,key)=>{
          
          let account = a.username!=null;

          return (
          <tr key={key} className={a.enable?"table-success":""}>
            <td className="opacity3">
              {account?
                <span key="B"><i className="fas fa-user"></i></span>
                :<span key="A"><i className="fas fa-hashtag"></i></span>
                }
            </td>
            <td>
              <strong><a href={`https://www.instagram.com/${a.username}`} target="_blank">{a.username || a.hashtag}</a></strong>
            </td>
            <td>{a.follow_count || 0}</td>
            <td><small>{this.beautifulDate(a.last_scan_datetime)} {a.last_scan_datetime>0&&`(+${a.last_scan_new_entries})`}</small></td>
            <td>{a.following<50?<span className="warn_msg">Pas assez de données</span>:Math.round(a.ratio*100)+"%"}</td>
            <td>
              {a.enable?
              <button className="small" onClick={()=>{ account?this.disableSpyAccount( a.username ):this.disableSpyHashtag( a.hashtag ) }}>Désactiver</button>
              :
              <button  className="small" onClick={()=>{ account?this.enableSpyAccount( a.username ):this.enableSpyHashtag( a.hashtag ) }}>Activer</button>
              }

              <button className="small" onClick={()=>{ account?this.removeSpyAccount(a.username):this.removeSpyHashtag(a.hashtag) }}> <span className="fa fa-times"></span> </button>

            </td>
          </tr>
          )
        }
        )}
      
        </tbody>
        </table>

      </div>}

      </div>
    ])
  }
}

export default connect(state => state)(Spy);
