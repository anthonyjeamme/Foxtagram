import React, {Component} from 'react';

import FillVertical from 'fillvertical';

import {connect} from 'react-redux';

class AccountAge extends Component {

    constructor(props) {

        super(props);

        this.state = {
            age: null
        }

        this.sentAge = this
            .sentAge
            .bind(this)
    }

    sentAge() {

        let {age} = this.state

        fetch(this.props.reducer.server + "mainaccountage", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
                body: JSON.stringify({age})
            })
            .then(d => d.json())
            .then((d) => {

                if (d.success) {

                    this
                        .props
                        .onNext();

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
                    }}>Quand avez-vous créé le compte ?</h1>

                    <p>
                        Quand un compte est jeune, les limitations sont plus importantes.
                    </p>
                    <p>
                        Si vous n'êtes pas sûr, prennez la date la plus ancienne dont vous êtes certains.
                    </p>

                    <select
                        onChange={(e) => {
                        this.setState({age: e.target.value})
                    }}
                        className="form-control">

                        <option selected disabled>Sélectionner</option>
                        <option value="0">Aujourd'hui</option>
                        <option value="1">Il y a 1 jour</option>

                        {Array
                            .apply(null, {length: 18})
                            .map(Number.call, Number)
                            .map(i => <option value={i + 2}>Il y a {i + 2} jours</option>)
                        }

                        <option value="20">Il y a plus de 20 jours</option>
                    </select>

                    {this.state.age < 20?[<p>
                        Pour les nouveaux compte, nous vous conseillons de publier 2 ou 3 images et d'attendre 2 ou 3 semaines avant d'utiliser le robot. Pensez également à vous connecter sur votre compte avec votre smartphone.
                    </p>,<p>
                        Si vous utilisez quand même Foxtagram, les follows se ferons au ralenti jusqu'à ce que votre compte ai 20 jours d'ancienneté.
                    </p>]:null}

                    <hr/>
                    <div className="center">
                        <button
                            disabled={this.state.age == null}
                            className="big"
                            onClick={this.sentAge}>Suivant</button>
                    </div>
                </div>

            </FillVertical>
        );
    }
}

export default connect(state => state)(AccountAge);