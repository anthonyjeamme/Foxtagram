import React, {Component} from 'react';
import { connect } from 'react-redux';
import Header from '../Header/Header';

class Blog extends Component {

    render() {
        return (
            <div className="Blog">
                <Header/>
                
                <div className="container">
                    <div className="hero">
                        <div className="hero-body columns">

                            <div className="column is-4">
                                <h1 className="title">Le blog</h1>
                            </div>

                            <div className="column is-8">

                                <div className="field has-addons">
                                    <div className="control is-expanded">
                                        <input className="input  is-medium" type="text" placeholder=""/>
                                    </div>
                                    <div className="control">
                                        <button className="button is-primary is-medium">
                                            <i className="fas fa-search"/>
                                        </button>
                                    </div>
                                </div>
                                
                            </div>

                        </div>
                    </div>


                    <section className="section has-background-white">
                        <h1 className="title">
                            Les 5 façons de monter un compte Instagram
                        </h1>
                        <h2 className="subtitle">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident excepturi facere dolore minima voluptates distinctio, perferendis reprehenderit aliquid, incidunt molestiae voluptas et. Repellendus blanditiis aliquid facere dolorem quam cumque hic.
                        </h2>
                    </section>

                    <br/>

                    <section className="section has-background-white">
                        <h1 className="title">
                            Les 5 façons de monter un compte Instagram
                        </h1>
                        <h2 className="subtitle">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident excepturi facere dolore minima voluptates distinctio, perferendis reprehenderit aliquid, incidunt molestiae voluptas et. Repellendus blanditiis aliquid facere dolorem quam cumque hic.
                        </h2>
                    </section>

                
                </div>

            </div>
        )
    }
}

export default connect( state => state )( Blog );