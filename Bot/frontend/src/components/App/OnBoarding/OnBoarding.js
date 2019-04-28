import React, { Component } from 'react'

import Welcome from './Steps/Welcome';
import MainAccount from './Steps/MainAccount';
import AccountAge from './Steps/AccountAge';
import OtherAccount from './Steps/OtherAccount';
import Spy from './Steps/Spy';
import ApiKey from './Steps/ApiKey';
import Ready from './Steps/Ready';

import {connect} from 'react-redux'


class OnBoarding extends Component {

  constructor(props){
    super(props);

    this.state={
      step:0
    }

    this.next = this.next.bind(this);
    this.endOnboarding = this.endOnboarding.bind(this)
  }

  next(){

    this.setState({
      step:this.state.step+1
    })
  }

  endOnboarding(){
    
    fetch(this.props.reducer.server + "/params/onboarding/finished", {
      method: "POST",
      headers: new Headers({"Content-Type": "application/json"}),
    })
    .then(d => d.json())
    .then((d) => {

      if (d.success) {

        window.location.reload();

      } else {
        alert(d.message)
      }
    });
  }

  render() {
    
    switch( this.state.step ){

      case 1:
        return (<ApiKey onNext={this.next}/>);
      case 2:
        return (<MainAccount onNext={this.next}/>);
      case 3:
        return (<AccountAge onNext={this.next}/>);
      case 4:
        return (<OtherAccount onNext={this.next}/>);
      case 5:
        return (<Spy onNext={this.next}/>);
      case 6:
        return (<Ready onNext={this.endOnboarding}/>);
      default:
        return (<Welcome onNext={this.next}/>);
    }
  }
}

export default connect(state => state)(OnBoarding);