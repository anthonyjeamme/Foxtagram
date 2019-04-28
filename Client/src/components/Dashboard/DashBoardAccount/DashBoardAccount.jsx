import React, {Component} from 'react';
import { FormattedMessage } from 'react-intl';

import { connect } from 'react-redux';

import { PatchAccountRunRequest, PostAccountSpyRequest, DeleteAccountSpyRequest } from 'store/actions/me';
import DashBoardAccountProfile from './DashBoardAccountProfile';

const SpyDropdown = ({children, item, onDelete}) => {

    let { n_follow, n_follow_back } = item;
    let n_follow_back_ratio = n_follow===0?0:n_follow_back / n_follow;

    let indicatorValue = (
        n_follow<100 || n_follow_back_ratio<0.1?0:
        n_follow_back_ratio<0.2?1:
        2
    );
    
    return (
        <div className="dropdown is-hoverable">
            <div className="dropdown-trigger">

                {children}
                
            <div className="dropdown-menu" role="menu">
                <div className="dropdown-content">
                    <div className="dropdown-item">
                        <div className="tags has-addons">

                                {
                                    indicatorValue===0?(
                                        <span className="tag is-medium is-danger">
                                            <i className="fas fa-thermometer-empty"/>
                                        </span>
                                    ):
                                    indicatorValue===1?(
                                        <span className="tag is-medium is-warning">
                                            <i className="fas fa-thermometer-half"/>
                                        </span>
                                    ):
                                    (
                                        <span className="tag is-medium is-success">
                                            <i className="fas fa-thermometer-full"/>
                                        </span>
                                    )
                                }
                            <span className="tag is-medium" style={{flex:1}}>
                                {
                                    indicatorValue===0?<FormattedMessage id="app.metric.bad"/>:
                                    indicatorValue===1?<FormattedMessage id="app.metric.medium"/>:
                                    <FormattedMessage id="app.metric.good"/>
                                }
                            </span>
                        </div>
                    </div>
                    <div className="dropdown-item has-text-centered">
                        { n_follow } <FormattedMessage id="dashboard.account.spy.followlabel"/>
                    </div>
                    <div className="dropdown-item has-text-centered">
                        { n_follow_back_ratio*100 } % <FormattedMessage id="dashboard.account.spy.followbacklabel"/>
                    </div>
                    <div className="dropdown-item">
                        <button
                            className="button is-danger is-fullwidth is-small has-icons-left"
                            onClick={onDelete}
                        >
                            <span className="icon is-left">
                                <i className="fas fa-times"/>
                            </span>
                            <span>
                                <FormattedMessage id="dashboard.account.spy.deletebutton" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

const SpyItem = ({item, onDelete}) => {
    
    let { name } = item;
    let isHashtag = name[0]==="#";

    return (
        <SpyDropdown item={item} onDelete={onDelete}>
            <div
                className="tags has-addons is-cursor-pointer animated fadeIn">
                <span className="tag is-dark">
                    {isHashtag?<i className="fas fa-hashtag"/>:<i className="far fa-user"/>}
                </span>
                <span className={`tag `}>{name}</span>
            </div>

        </SpyDropdown>
    )
}

class DashBoardAccount extends Component {

    constructor( props ){
    
        super( props );
    
        this.state={
            newSpyInput:""
        };

        this.sendNewSpy = this.sendNewSpy.bind(this);
    }

    sendNewSpy(){

        this.props.dispatch( PostAccountSpyRequest({ accountid:this.props.account.id, spy:this.state.newSpyInput} ));

        this.setState({
            newSpyInput:""
        });
    }

    render(){

        let { account } = this.props;

        let { run } = account;

        // backgroundSize:"cover",
        // backgroundImage:`url('${account.profileImage}')`

        return (
        <div>
            <section className="section has-background-white">

                <div className="columns">
                    <div className="column has-text-centered is-3">

                        <DashBoardAccountProfile account={account} />

                    </div>
                    <div className="column has-text-centered is-6">

                        <div className="field has-addons">
                            <div className="control is-expanded">
                                <input
                                    className="input"
                                    placeholder="Compte ou # à espionner"
                                    value={this.state.newSpyInput}
                                    onChange={e=>{this.setState({
                                        newSpyInput:e.target.value
                                    })}}
                                    onKeyDown={e=>{
                                        if( e.keyCode===13 )
                                            this.sendNewSpy();
                                    }}
                                    />
                            </div>
                            <div className="control">
                                <button
                                    className="button is-primary"
                                    onClick={this.sendNewSpy}
                                    >
                                        <FormattedMessage id="dashboard.account.spybutton"/>
                                    </button>
                            </div>
                        </div>

                        <div className="field is-grouped is-grouped-multiline">
                        {
                            account.spys.map(item=><SpyItem key={item.name} onDelete={()=>{

                                this.props.dispatch( DeleteAccountSpyRequest({ accountid:account.id, spyname:item.name} ));

                            }} item={item}/>)
                        }
                        </div>

                    </div>
                    <div className="column has-text-centered is-3">

                        <button
                            style={{transition:"all 200ms"}}
                            className={`button has-icons is-small ${this.props.account.run?"is-success":"is-warning"}`}
                            onClick={()=>{
                                this.props.dispatch( PatchAccountRunRequest( { accountid: account.id, value: !this.props.account.run } ) )
                            }}
                            >
                            <span className="icon">
                                {
                                    this.props.account.run?
                                        <span key='is-running'><i className={`fas fa-basketball-ball fa-spin`}/></span>:
                                        <span key='not-running'><i key='not-running' className={`fas fa-basketball-ball`}/></span>
                                }
                            </span>
                            <span>
                                {
                                    this.props.account.run?
                                        <FormattedMessage id="dashboard.account.stopbutton"/>:
                                        <FormattedMessage id="dashboard.account.runbutton"/>
                                }
                            </span>
                        </button>
                    </div>
                </div>
            </section>
            <br/>
        </div>
        )
    }
}

export default connect( state => state )( DashBoardAccount );