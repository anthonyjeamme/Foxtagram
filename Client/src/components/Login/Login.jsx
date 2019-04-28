import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

class Login extends Component {
	static propTypes = {
		prop: PropTypes
	}

	render() {
		return (
			<div className="Login hero is-fullheight">

				<div className="hero-body">

					<div className="container has-text-centered">
						<div class="column is-4 is-offset-4">

						<div class="box">
						<h1 className="title has-text-grey">Connexion</h1>
						<hr/>

						<div className="field">
							<div className="control has-icons-left">
							
								<input className="input" placeholder="Username"/>
								<span className="icon is-left">
									<i className="fas fa-envelope"></i>
								</span>
							</div>
						</div>

						<div className="field">
							<div className="control has-icons-left">
							
								<input className="input" type="password" placeholder="Password"/>
								<span className="icon is-left">
									<i className="fas fa-lock"></i>
								</span>
							</div>
						</div>

						<hr/>

						<button className="button is-primary  is-fullwidth">
							Login
						</button>

						<Link to="/">
							<button className="button is-warning  is-fullwidth">
								Retour
							</button>
						</Link>

						</div>

					</div>
					</div>
				</div>
			</div>
		)
	}
}

export default connect( state => state )( Login );