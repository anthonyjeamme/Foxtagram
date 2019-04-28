import React, {Component} from 'react';
import {connect} from 'react-redux';

import Spy from './Spy/Spy';
import Config from './Config/Config';
import Dashboard from './Dashboard/Dashboard';
import Onboarding from './OnBoarding/OnBoarding';
import Stats from './Stats/Stats';

import KeyError from './KeyError/KeyError'

import FillVertical from 'fillvertical'

import {BrowserRouter, Switch, Route} from 'react-router-dom'

import './App.css';

class Routes extends Component {

  constructor(props){
    super(props);

    this.state={
      loading:true,
      onboarding:false
    }
    
    this.loadParams = this.loadParams.bind(this);

  }

  componentDidMount = () => {
    this.loadParams();

    this.interval = setInterval(this.loadParams, 2000);
  }

  componentWillUnmount = () => {
    if( this.interval ) clearInterval(this.interval);
  }

  loadParams(){

    fetch( this.props.reducer.server+"/params" )
    .then( response => response.json() )
    .then( data=>{
      this.setState({
        loading:false,
        onboarding:data.params.onboarding,
        keyError: data.params.keyError
      })
    })
  }

  render() {

    if( this.state.loading ) return <div></div>;

    if( this.state.keyError ) return <KeyError reloadParams={this.loadParams}/>;

    if( this.state.onboarding ) return <Onboarding/>;

    return (
        <BrowserRouter>
          <Switch>
            <Route exact path='/' component={Dashboard}/>
            <Route exact path='/Spy' component={Spy}/>
            <Route exact path='/Config' component={Config}/>
            <Route exact path='/Stats' component={Stats}/>
          </Switch>
        </BrowserRouter>
    )
  }
}

const RoutesC = connect(state => state)(Routes);

const ServerNotAvailable = (props) => (

  <FillVertical justifyContent="center" style={{ textAlign: "center", color:"#aaa" }}>

      <div className="center" style={{marginBottom:50}}>
        <span className="fas fa-exclamation-circle" style={{fontSize:"80px"}}></span>
      </div>

      <h1>Serveur non disponible</h1>

  </FillVertical>
);

const LoadingScreen = () => (
  
  <FillVertical justifyContent="center" >
    <div className="center">

      <div>
        <img src="/img/logo_big.png" alt="logo" height={300} style={{marginBottom:50}}/>
      </div>

      <span className="fa fa-spinner fa-spin" style={{fontSize:"80px", color:"#cd6133"}}></span>
    </div>
  </FillVertical>
)

class App extends Component {

  constructor( props ){

    super(props);

    this.state={
      loading:true,
      connected:false
    }

    this.interval = null;
    this.pingServer = this.pingServer.bind(this)
  }

  async pingServer(cb=()=>{}){

    fetch( `${this.props.reducer.server}/ping` )
      .then( response => response.json() )
      .then( data=>{

        this.setState({
          connected: data.success
        });
        cb()

      }).catch(e=>{
        
        this.setState({
          connected: false
        });
        cb()
      });
  }

  componentDidMount = () => {

    this.pingServer( ()=>{ this.setState({loading:false}) } );

    this.interval = setInterval(this.pingServer,5000);
  }

  componentWillUnmount = () => {

    if( this.interval )
      clearInterval( this.interval );
  }

  render() {

    return (
      this.state.loading?<LoadingScreen/>:
      this.state.connected?
      <RoutesC/>
      :<ServerNotAvailable/>
    );
  }
}

export default connect(state => state)(App);
