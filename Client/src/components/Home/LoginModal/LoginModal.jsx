import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class LoginModal extends Component {
    static propTypes = {
        open: PropTypes.bool
    }

    render() {
        return (
            <div className={`modal ${this.props.open&&" is-active"}`}>
                <div className="modal-background"></div>
                
                <div className="modal-content has-text-centered">

                    <img src="/img/logo.png" alt="logo" className="image is-128x128 is-margin-auto is-rounded"
                        style={{ marginBottom:20 }}/>
                
                    <h1 className="title has-text-white">Connexion</h1>

                    <p></p>

                    <p>
                        <button className="button is-large is-info">
                            <span className="icon">
                                <i className="fab fa-facebook-f"/>
                            </span>
                            <span>
                                Se connecter avec facebook
                            </span>
                        </button>
                    </p>

                </div>
                <button className="modal-close is-large" aria-label="close" onClick={this.props.onClose}></button>
            </div>
        )
    }
}

export default connect( state => state )( LoginModal );