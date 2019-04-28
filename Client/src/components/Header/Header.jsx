import React, {Component} from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { withRouter, Link } from 'react-router-dom';

import Auth from 'auth';
import { FormattedMessage } from 'react-intl';

const HeaderBurger = ({onClick})=>(
    <span
        role="button"
        className="navbar-burger"
        data-target="navMenu"
        aria-label="menu"
        aria-expanded={false}
        onClick={onClick}
        >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
    </span>
);

const HeaderBrand = ({connected}) => (
    
    <Link to={connected?"/dashboard":"/"} className="navbar-item">
        <img alt="logo" src="/img/logo.png" className="is-rounded is-shadow" style={{marginRight:15}}/>
        Foxtagram
    </Link>
);

const HeaderLoginItem = ({onClick}) => (
    <div className="navbar-item">
        <button className="button is-primary" onClick={onClick}>
            <span className="icon">
                <i className="fas fa-user"/>
            </span>
            <span><FormattedMessage id="header.connection"/></span>
        </button>
    </div>
);

const HeaderAccountItem = ({}) => (
    <div className="navbar-item">
        <button className="button is-primary">
            <span className="icon"><i className="fas fa-user"/></span>
            <span><FormattedMessage id="header.account.free"/></span>
        </button>
    </div>
)

const HeaderLogoutItem = ({onClick}) => (
    <div className="navbar-item">
        <button className="button is-primary" title="Se déconnecter" onClick={onClick}>
            <span className="icon"><i className="fas fa-sign-out-alt"/></span>
        </button>
    </div>
);

class Header extends Component {

    constructor( props ){
    
        super( props );
    
        this.state={
            mobileOpen:false
        };

        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
    }

	static propTypes = {

        onClickLogin: PropTypes.func,
        onClickCoins: PropTypes.func.isRequired
    }
    
    logout(){

        let auth = new Auth();
        auth.logout( this.props.history );
    }

    login(){

        let auth = new Auth();
        auth.login();  
    }

	render() {

        let connected = new Auth().isAuthenticated( this.props.history );

		return (
            <nav className="navbar  is-primary animated fadeInDown" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <HeaderBrand connected={connected}/>

                    <HeaderBurger onClick={()=>{ this.setState({
                        mobileOpen:!this.state.mobileOpen
                    }) }}/>
                </div>
                
                <div className={`navbar-menu ${this.state.mobileOpen&&"is-active has-text-dark"}`}>
                    <div className="navbar-end">

                        { connected && <HeaderAccountItem /> }
                        { connected && <HeaderLogoutItem onClick={this.logout} />}
                        { !connected && <HeaderLoginItem onClick={this.login} />}

                    </div>
                </div>
            </nav>
		)
	}
}

export default withRouter( connect( state => state )( Header ) );
