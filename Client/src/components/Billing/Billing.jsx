import React, { Component } from 'react';
import { CardElement, injectStripe, Elements, StripeProvider } from 'react-stripe-elements';
import { FormattedMessage } from 'react-intl';

import Api from 'store/api/api';

const BillingFormPart = ({children, className}) => (
    
    <div className={`hero is-small ${className}`}>
        <div className="hero-body">
            <div className="container">
                { children }
            </div>
        </div>
    </div>
);

const BillingFormLabelledInput = ({label, children}) => (
    <div className="field is-horizontal">
        <div className="field-label is-normal">
            <label className="label">{ label }</label>
        </div>
        <div className="field-body">
            <div className="field">
                { children }
            </div>
        </div>
    </div>
)

class Billing extends Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);

        this.offer = "premium";
        this.price = 19.99;
    }

    async submit(ev) {
        let Token_ = await this.props.stripe.createToken({name: "Name"});

        console.log(Token_)

        let {token} = Token_;

        Api.PostPayment( {
            token,
            email: "tonyjahim@gmail.com"
        });
    
    }

    render() {
        return (
            <div className="hero has-background-gray-light is-fullheight">
                <div className="hero-body">
                    <div className="container">

                        <h1 className="title has-text-centered">
                            <FormattedMessage id="paiement.title"/>
                        </h1>

                        <BillingFormPart className="has-text-centered">

                            <FormattedMessage id="paiement.description" values={{
                                choice:<strong>{this.offer}</strong>,
                                mensuality:<strong><FormattedMessage id="app.mensuality" values={{price: this.price}}/></strong>
                            }}/>

                        </BillingFormPart>

                        <br/>

                        <BillingFormPart className="has-background-white">

                            <p>
                                <strong>
                                    <FormattedMessage id="paiement.billing.title"/>
                                </strong>
                            </p>

                            <br/>

                            <CardElement style={{
                                base: {
                                    fontSize: '20px'
                                }
                                }}
                            />

                        </BillingFormPart>

                        <br/>

                        <button className="button is-medium has-icons is-fullwidth is-primary" onClick={this.submit}>
                            <span>
                                <FormattedMessage id="paiement.valid" />
                            </span>
                        </button>

                        <hr/>

                        <p className="has-text-centered">
                            <img alt="Stripe logo" src="/img/powered_by_stripe_black.png"/>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectStripe(Billing);

/*
    <br/>

    <BillingFormPart className="has-background-white">

        <BillingFormLabelledInput label="Nom">
            <input className="input"/>
        </BillingFormLabelledInput>

        <BillingFormLabelledInput label="Email">
            <input className="input"/>
        </BillingFormLabelledInput>

        <BillingFormLabelledInput label="Address">
            <input className="input"/>
        </BillingFormLabelledInput>
        
        <BillingFormLabelledInput label="City">
            <input className="input"/>
        </BillingFormLabelledInput>
        
        <BillingFormLabelledInput label="State">
            <input className="input"/>
        </BillingFormLabelledInput>

    </BillingFormPart>
*/