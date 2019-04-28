import React, {Component} from 'react';

import { connect } from 'react-redux';
import FooterLang from './FooterLang/FooterLang';

class Footer extends Component {

    render() {
        return (
            <footer className="footer has-background-dark has-text-light">

                <div className="content container has-text-centered">
                    <div className="columns">
								<div className="column">
									
                                    <strong className="has-text-light">Informations légales</strong>

                                    <p>
                                        <br/>
                                        <small>CGV / CGU</small>
                                        <br/>
                                        <small>Politique de confidentialité</small>
                                    </p>

								</div>
								<div className="column">
									<a href="mailto:contact@foxtagram.jinga.fr">
                                        <button className="button has-icons">
                                            <span className="icon">
                                                <i className="fas fa-envelope"/>
                                            </span>    
                                            <span>Nous contacter</span>
                                        </button>
                                    </a>
								</div>
								<div className="column">
                                
                                    <FooterLang/>

                                </div>
                    </div>
                </div>
            </footer>
        )
    }
}

export default connect( state => state )( Footer );