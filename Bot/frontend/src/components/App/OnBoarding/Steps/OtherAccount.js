import React, {Component} from 'react';

import FillVertical from 'fillvertical';

import {connect} from 'react-redux';

class MainAccount extends Component {

  constructor(props) {

    super(props);

    this.state = {
      username: "",
      password: ""
    }

    this.validForm = this
      .validForm
      .bind(this)
  }

  validForm() {

    let { username, password} = this.state;

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
          }}>Compte secondaire</h1>

          <p>
              Pour fonctionner, Foxtagram a besoin d'un compte secondaire. Ce compte est utilisé pour scanner les pages. Cela permet d'alléger l'activité de votre compte principale.
          </p>

          <p>
            Créez un compte Instagram que vous n'utiliserez pas.
        </p>
        <p><small>
            Conseil: si vous avez une adresse gmail (par exemple foxtagram@gmail.com), vous pouvez créer un nouveau compte avec le mail foxtagram+fakeaccount@gmail.com.
            Instagram va croire qu'il s'agit d'un autre mail. En réalité les mails sont redirigés vers votre compte foxtagram@gmail.com</small>
        </p>
        <p><small>
            Autre conseil : Pensez à bien valider votre mail de création de compte et d'ajouter une photo à votre compte. Sinon le compte sera rapidement bloqué.</small>
        </p>

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