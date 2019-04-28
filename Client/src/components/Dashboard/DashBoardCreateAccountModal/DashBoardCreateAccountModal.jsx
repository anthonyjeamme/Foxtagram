import React, {Component} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import { PostAccountRequest } from 'store/actions/me';

class DashBoardCreateAccount extends Component {

    static propTypes = {
        open: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired
    }

    constructor( props ){
    
        super( props );
    
        this.state={
            open: false,
            username:"",
            password:""
        };

        this.postAccount = this.postAccount.bind(this);
    }

    postAccount(){
    
        this.props.dispatch( PostAccountRequest({username: this.state.username, password: this.state.password}) );
        this.setState({username:"", password:""});
        this.props.onClose();
    }

    render() {
        return (
            <div className={`DashBoardCreateAccount modal ${this.props.open && "is-active"}`}>
                <div className="modal-background"></div>
                <div className="modal-content">

                    <h1 className="title has-text-light has-text-centered">
                        <FormattedMessage id="dashboard.createaccount.title"/>
                    </h1>

                    <hr/>

                    <div className="field">
                        <div className="control has-icons-left">
                            
                            <FormattedMessage id="dashboard.createaccount.usernamelabel">
                            {
                                usernamelabel => (
                                    <input
                                        value={this.state.username}
                                        onChange={e=>{this.setState({ username: e.target.value.toLowerCase() })}}
                                        className="input is-medium"
                                        placeholder={usernamelabel}
                                        />
                                )
                            }
                            </FormattedMessage>
                            <span className="icon is-small is-left">
                                <i className="fab fa-instagram"></i>
                            </span>
                        </div>
                    </div>
                    <div className="field">
                        <div className="control has-icons-left">
                            
                            <FormattedMessage id="dashboard.createaccount.passwordlabel">
                                { passwordlabel => (
                                    <input
                                        value={this.state.password}
                                        onChange={e=>{this.setState({ password: e.target.value })}}
                                        placeholder={passwordlabel}
                                        onKeyDown={e=>{
                                            if( e.keyCode === 13 ){
                                                this.postAccount()
                                            }
                                        }}
                                        type="password"
                                        className="input is-medium"
                                        />
                                    )
                                }
                            </FormattedMessage>
                            <span className="icon is-small is-left">
                                <i className="fas fa-lock"></i>
                            </span>
                        </div>
                    </div>

                    <hr/>

                    <p>
                        <button
                            className="button is-medium is-primary is-fullwidth"
                            onClick={this.postAccount}
                            >
                                <span className="icon is-small is-left">
                                    <i className="fas fa-plus"></i>
                                </span>
                                <span><FormattedMessage id="dashboard.createaccount.createbutton"/></span>
                        </button>
                    </p>
                </div>
                <button
                    onClick={this.props.onClose}
                    className="modal-close is-large"
                    aria-label="close"></button>
            </div>
        )
    }
}

export default connect( state => state )( DashBoardCreateAccount );