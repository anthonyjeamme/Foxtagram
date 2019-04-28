import React, {Component} from 'react';
import { connect } from 'react-redux';

import { withRouter } from 'react-router-dom';

import Auth from 'auth';
import LoadingPage from '../LoadingPage/LoadingPage';

class AuthCallback extends Component {

    componentDidMount(){
        
        let { history } = this.props;

        let auth = new Auth();

        auth.handleAuthentication( history )
    }

    render() {

        return (
            <LoadingPage/>
        )
    }
}

export default withRouter( connect( state => state )( AuthCallback ) );