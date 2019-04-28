import React, {Component} from 'react';

import { connect } from 'react-redux';
import Header from '../Header/Header';

import ShortDescription from './ShortDescription/ShortDescription';

import Price from './Price/Price';
import LoginModal from './LoginModal/LoginModal';
import Footer from '../Footer/Footer';

class Home extends Component {

	constructor( props ){
	
		super( props );
	
		this.state={
			loginModalOpen:false
		};
	}

	render() {

		return (
			<div className="Home">

				<LoginModal open={this.state.loginModalOpen} onClose={()=>{this.setState({loginModalOpen:false})}}/>

				<div className={`is-blur-transition ${this.state.loginModalOpen&&"is-blur"}`}>

				<div className="hero is-fullheight">
					<div className="hero-head">
						<Header onClickLogin={()=>{this.setState({loginModalOpen:true})}}/>
					</div>
				<div className="hero-body">
					<ShortDescription/>
				</div>
				</div>

				<div className="hero">
					<div className="hero-body has-text-centered">
						<div className="container">

						<div className="box">
							<h2 className="subtitle">Comment ça marche ?</h2>
							<p>
								Durant la configuration, vous choisissez des hashtags et des comptes Instagram qui correspondent à votre ciblage.
							</p>
							<p>
								Le bot Foxtagram se chargera de follow automatiquement et d'aimer les photos des utilisateurs extraits de ces hashtags et comptes.
							</p>
							<p>
								Le bot Foxtagram unfollow intelligement les utilisateurs après un certain délai afin de ne pas surcharger votre compte. 
							</p>
						</div>

						<div className="box">
							<h2 className="subtitle">C'est risqué ?</h2>
							<p>
								La priorité chez Foxtagram est la sécurité de votre compte.
							</p><p>
								Vos données sont stockés sur un serveur sécurité et le robot est conçu pour éviter tout blocage de la part d'Instagram.
							</p>
						</div>

						<div className="box">
							<h2 className="subtitle">Est-ce que je peux utiliser mon compte pendant que Foxtagram travaille ?</h2>
							<p>
								Nous vous conseillons de créer des posts régulièrement afin d'accélerer le processus.
							</p>
							<p>
								Instagram fixe des limites de follow, unfollow, like. Nous vous conseillons donc vivement de ne pas follow, unfollow et aimer des posts quand Foxtagram travaille. Cela risquerai d'éveiller les soupçons d'Instagram, pouvant entrainer le blocage de votre compte.
							</p>
						</div>

					</div>
					</div>
				</div>

				<div className="hero">
					<div className="hero-body has-text-centered">
						<Price/>
					</div>
				</div>

				<Footer/>

				</div>
			</div>
		)
	}
}

export default connect( state => state )( Home );