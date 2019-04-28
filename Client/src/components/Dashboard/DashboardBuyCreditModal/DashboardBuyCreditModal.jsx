import React, {Component} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

class DashboardBuyCreditModal extends Component {

    static propTypes = {
        open: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired
    }

    constructor( props ){
    
        super( props );
    
        this.state={
            open: false,
            creditAmount: 1000,
            valid:true
        };

        this.setAmount = this.setAmount.bind(this);
    }


    setAmount( value ){

        let valid=true;

        let creditAmount = parseInt(value,10);
        
        if( creditAmount < 1000 ) valid = false;

        this.setState({ creditAmount, valid })
    }

    render() {
        return (
            <div className={`DashboardBuyCreditModal modal ${this.props.open && "is-active"}`}>
                <div className="modal-background"></div>
                <div className="modal-content has-text-light">

                    <h1 className="title has-text-light has-text-centered">
                        <FormattedMessage id="dashboard.buycredit.title"/>
                    </h1>

                    <p className="has-text-centered">
                        <FormattedMessage id="dashboard.buycredit.details"/>
                    </p>

                    <br/>

                    <div className="field">

                        <div className="control has-icons-left">
                            
                            <span className="icon  is-left">
                                <i className="fas fa-coins"></i>
                            </span>
                            <input
                                className={`input ${!this.state.valid&&"is-danger"}`}
                                type="number"
                                step={100}
                                min={1000}
                                value={this.state.creditAmount}
                                onChange={e=>{this.setAmount(e.target.value)}}
                                />
                            
                            {!this.state.valid && <span className="help is-danger">
                                <FormattedMessage id="dashboard.buycredit.minamounthelp"/>
                            </span>}
                        </div>
                    </div>
                    <div className="field">
                        <div className="control">

                            <button
                                disabled={!this.state.valid}
                                className="button is-primary is-medium is-fullwidth">
                                Payer { this.state.creditAmount / 1000 }€
                            </button>

                        </div>
                    </div>

                    <br/>

                    <div className="has-text-centered has-text-light">

                        <p>
                            Paiement sécurisé par Stripe
                        </p>
                        <br/>
                        <img
                            src="/img/powered_by_stripe@2x.png"
                            alt="stripe logo" style={{ maxWidth:150 }}
                            className="is-margin-auto"
                            />
                    </div>

                </div>
                <button
                    onClick={this.props.onClose}
                    className="modal-close is-large"
                    aria-label="close"></button>
            </div>
        )
    }
}

export default connect( state => state )( DashboardBuyCreditModal );