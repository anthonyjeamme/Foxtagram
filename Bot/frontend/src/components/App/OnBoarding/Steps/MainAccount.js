import React, {Component} from 'react';
import FillVertical from 'fillvertical';
import {connect} from 'react-redux';

class MainAccount extends Component {

  constructor(props) {

    super(props);

    this.state = {
      username: "",
      password: ""
    };

    this.validForm = this
      .validForm
      .bind(this);
  }

  validForm() {

    let { username, password} = this.state;
    
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

          this.props.onNext();

        } else {
          alert(d.message)
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
          }}>Compte principale</h1>

          <div
            style={{
            maxWidth: 400,
            margin: "auto"
          }}>
            <div style={{
              "margin": 10
            }}>
              <input
                placeholder="Nom d'utilisateur"
                value={this.state.username}
                onChange={(e) => {
                this.setState({username: e.target.value})
              }}
                style={{
                margin: 0
              }}
                className="form-control"/>
            </div>
            <div style={{
              "margin": 10
            }}>
              <input
                placeholder="Mot de passe"
                value={this.state.password}
                onChange={(e) => {
                this.setState({password: e.target.value})
              }}
                style={{
                margin: 0
              }}
                type="password"
                className="form-control"/>
            </div>
          </div>

          <hr/>
          <div className="center">
            <button
              disabled={this.state.username === "" || this.state.password === ""}
              className="big"
              onClick={this.validForm}>Suivant</button>
          </div>
        </div>

      </FillVertical>
    );
  }
}

export default connect(state => state)(MainAccount);