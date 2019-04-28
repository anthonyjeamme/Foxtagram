import React, {Component} from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

export default class UnknownPage extends Component {
	static propTypes = {
		prop: PropTypes
	}

	render() {
		return (
			<div className="UnknownPage hero is-fullheight is-danger is-bold">
			
				<div className="hero-body">
    				<div class="container has-text-centered">

						<i className="fas fa-frown fa-3x"></i>
						<h1 className="title">Unknown Page</h1>

						<hr/>

						<Link to="/">
							<button className="button is-large">
								<i className="fa fa-home"/> Go Home						
							</button>
						</Link>

					</div>
				</div>
			</div>
		)
	}
}