import React, {Component} from 'react';
import { connect } from 'react-redux';
import Header from '../Header/Header';
import DashBoardAccount from './DashBoardAccount/DashBoardAccount';
import  { Redirect, withRouter } from 'react-router-dom';

import Auth from 'auth';
import DashBoardCreateAccountModal from './DashBoardCreateAccountModal/DashBoardCreateAccountModal';
import DashboardBuyCreditModal from './DashboardBuyCreditModal/DashboardBuyCreditModal';

import {
    GetMeRequest
} from 'store/actions/me';
import LoadingPage from '../LoadingPage/LoadingPage';
import { FormattedMessage } from 'react-intl';

const NoAccount = () => (
    <div className="hero">
        <div className="hero-body has-text-centered">
            <small><FormattedMessage id="dashboard.noaccount"/></small>
        </div>
    </div>
)

const DashboardNewAccounts = ({state, onClick, accounts}) => (
    <div className={`hero ${state.createAccountOpen || state.buyCreditOpen ? "is-blur" : "is-blur-transition"}`}>
    <div className="hero-body">
        <div className="container">
    
            <h1 className="title"><FormattedMessage id="dashboard.title"/></h1>

            {
                accounts.map( (account,key) => (
                    <DashBoardAccount key={key} account={account} />
                ) )
            }

            { accounts.length === 0 && <NoAccount/> }

            <button
                className="button is-fullwidth"
                onClick={onClick}
                >
            
                <span className="icon">
                    <i className="fas fa-user-plus"/>
                </span>
                <span><FormattedMessage id="dashboard.addaccount"/></span>
            </button>

        </div>
    </div>
</div>
)

class Dashboard extends Component {
    constructor( props ){
    
        super( props );
    
        this.state={
            createAccountOpen:false,
            buyCreditOpen: false
        };
    }

    componentDidMount(){
        
        if( !this.props.me.isLoaded ){
            this.props.dispatch(GetMeRequest())
        }
    }

    render() {

        let auth = new Auth();
        let isAuthenticated = auth.isAuthenticated( this.props.history );

        if (!isAuthenticated)
            return <Redirect to='/'  />

        let accounts = this.props.me.accounts;
        
        if( !this.props.me.isLoaded )
            return (<LoadingPage/>);

        return (
            <div className="Dashboard">

                <Header onClickCoins={()=>{
                    this.setState({
                        buyCreditOpen: true
                    })
                }}/>

                <DashBoardCreateAccountModal
                    open={this.state.createAccountOpen}
                    onClose={()=>{
                        this.setState({
                            createAccountOpen: false
                        })
                    }}
                    />
                <DashboardBuyCreditModal
                    open={this.state.buyCreditOpen}
                    onClose={()=>{
                        this.setState({
                            buyCreditOpen: false
                        })
                    }}
                    />

                <DashboardNewAccounts
                    state={this.state}
                    onClick={()=>{
                        this.setState({
                            createAccountOpen: true
                        })
                    }}
                    accounts={accounts}
                    />
            </div>
        )
    }
}

export default withRouter( connect( state => state )( Dashboard ));