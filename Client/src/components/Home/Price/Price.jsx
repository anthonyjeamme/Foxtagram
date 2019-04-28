import React, {Component} from 'react';

import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Auth from 'auth';

class Price extends Component {

    constructor( props ){
    
        super( props );
        this.start = this.start.bind(this);
    }

    start(){
        
        let auth = new Auth();
        auth.login();  
    }

	render() {

		return (
            <div className="container has-text-centered">

                <h2 className="title"><FormattedMessage id="home.price.title"/></h2>

                <hr/>

                <div className="columns">
                    <div className="column is-4 is-offset-2">
                        <div className="pricing-table">
                            <div className="pricing-plan is-primary">
                                <div className="plan-header"><FormattedMessage id="home.price.basic.title"/></div>
                                <div className="plan-price">
                                    <span className="plan-price-amount">
                                        <i className="plan-price-currency"/>
                                        9.90
                                    </span>€
                                    <FormattedMessage id="home.price.permonth"/>
                                </div>
                                <div className="plan-items">
                                <div className="plan-item">1 <FormattedMessage id="home.price.accounts"/></div>
                                <div className="plan-item"><FormattedMessage id="home.price.noinstallation"/></div>
                                <div className="plan-item"><FormattedMessage id="home.price.configureonline"/></div>
                                </div>
                                <div className="plan-footer">
                                    <button onClick={this.start} className="button is-fullwidth is-large"><FormattedMessage id="home.CTA"/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column is-4">
                        <div className="pricing-table">
                            <div className="pricing-plan is-primary">
                                <div className="plan-header"><FormattedMessage id="home.price.premium.title"/></div>
                                <div className="plan-price"><span className="plan-price-amount"><span className="plan-price-currency"></span>19.90</span>€<FormattedMessage id="home.price.permonth"/></div>
                                <div className="plan-items">
                                <div className="plan-item">3 <FormattedMessage id="home.price.accounts"/>s</div>
                                <div className="plan-item"><FormattedMessage id="home.price.noinstallation"/></div>
                                <div className="plan-item"><FormattedMessage id="home.price.configureonline"/></div>
                                </div>
                                <div className="plan-footer">
                                    <button onClick={this.start} className="button is-fullwidth is-large">
                                        <FormattedMessage id="home.CTA"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		)
	}
}

export default connect( state => state )( Price );