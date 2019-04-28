import React, {Component} from 'react';

import FillVertical from 'fillvertical';

export default class Welcome extends Component {

    render() {
        return (
            <FillVertical
                justifyContent="center"
                style={{
                textAlign: "center"
            }}>

                <div className="center container">
                    <div>
                        <img
                            src="/img/logo_big.png"
                            height={150}
                            alt="logo"
                            style={{
                            marginBottom: 50
                        }}/>
                    </div>

                    <p>
                        Bienvenue sur Foxtagram. Nous allons configurer votre robot en quelques étapes.
                    </p>

                    <hr/>
                    <div className="center">
                        <button className="big" onClick={this.props.onNext}>Suivant</button>
                    </div>
                </div>

            </FillVertical>
        )
    }
}
