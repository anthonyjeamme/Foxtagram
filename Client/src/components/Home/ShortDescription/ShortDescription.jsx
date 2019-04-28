import React, {Component} from 'react';

import { FormattedMessage } from 'react-intl';

import { connect } from 'react-redux';
import Auth from 'auth';

class ShortDescription extends Component {

	render() {

		let steps = [
			{text:<FormattedMessage id="home.step1text"/>, icon:"fas fa-cog"},
			{text:<FormattedMessage id="home.step2text"/>, icon:"fas fa-bullseye"},
			{text:<FormattedMessage id="home.step3text"/>, icon:"fas fa-umbrella-beach"}
		]

		return (
            <div className="container has-text-centered">

            <figure
                className="image is-128x128 is-margin-auto animated fadeIn is-delayed-500"
                style={{ marginBottom: 30 }}
                >
                <img src="/img/logo.png" alt="logo" className="is-rounded"/>
            </figure>

            <h1 className="title animated fadeIn is-delayed-1000">
            
                <FormattedMessage id="home.title"/>

            </h1>
            <h2 className="subtitle animated fadeIn is-delayed-1000"><FormattedMessage id="home.subtitle"/></h2>


            <div className="columns animated fadeInUp is-delayed-1500">
                { steps.map( (step,i) => (

                    <div className="column" key={i}>
                        <div className="box">
                            <p>
                                <i className={`${step.icon} fa-3x`}/>
                            </p>
                            <strong><FormattedMessage id="home.step"/> {i+1}</strong>
                            <p style={{ height: 60, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                                {step.text}
                            </p>
                        </div>
                    </div>
                ) )}
            </div>

            <p className="animated fadeIn is-delayed-2500">
                <button className="button is-primary is-large"
                    onClick={()=>{
                        let auth = new Auth();
                        auth.login();  
                    }}
                >
                    <span className="icon">
                        <i className="fas fa-cocktail"></i>
                    </span>
                    <span><FormattedMessage id="home.CTA"/></span>
                </button>
            </p>

            </div>
		)
	}
}

export default connect( state => state )( ShortDescription );