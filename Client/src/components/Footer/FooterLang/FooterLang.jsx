import React, {Component} from 'react';
import { connect } from 'react-redux';

import { changeLanguage } from 'store/actions/app';
import { FormattedMessage } from 'react-intl';

class FooterLang extends Component {

    render() {

        let languages = [
            { name: "Français", code: "fr" },
            { name: "English", code: "en" }
        ]

        return (
            <div className="FooterLang">
                <div>

                    <div className="dropdown is-hoverable">
                        <div className="dropdown-trigger">
                        <button
                            className="button is-small"
                            aria-haspopup="true"
                            aria-controls="dropdown-menu3">
                            <span>
                                <FormattedMessage id="footer.changeLang"/>
                                {' '}
                                ( {this.props.app.language} )
                            </span>
                            <span className="icon is-small">
                            <i className="fas fa-angle-down" aria-hidden="true" />
                            </span>
                        </button>
                        </div>
                        <div className="dropdown-menu" id="dropdown-menu3" role="menu">
                        <div className="dropdown-content">

                            {
                                languages.map( lang => (

                                    <a
                                        key={lang.code}
                                        onClick={()=>{
                                            this.props.dispatch( changeLanguage( lang.code ) )
                                        }}
                                        className="dropdown-item">
                                        { lang.name }
                                    </a>
                                ))
                            }

                        </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

export default connect( state => state )( FooterLang );


/*

									Langue
									<hr/>
									<p><button onClick={()=>{
										this.props.dispatch( changeLanguage( "fr" ) )
									}} className="button is-outlined is-small is-primary is-inverted is-fullwidth">Francais</button></p>
									<p><button onClick={()=>{
										this.props.dispatch( changeLanguage( "en" ) )
									}} className="button is-outlined is-small is-primary is-inverted is-fullwidth">English</button></p>

*/