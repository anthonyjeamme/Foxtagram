import React, {Component} from 'react';

import './Schedule.css';

import { connect } from 'react-redux';

class Schedule extends Component {

    constructor(props) {

        super(props);

        this.state = {
            periods: [
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
            ]
        }

        this.sendPeriods = this.sendPeriods.bind( this );
        this.loadParams = this.loadParams.bind(this);
    
    }

    componentDidMount = () => {
        this.loadParams();
    }
    
    loadParams(){

        fetch( this.props.reducer.server+"/params" )
        .then( response => response.json() )
        .then( data=>{

            let periods =  [
                false, false, false, false,
                false, false, false, false,
                false, false, false, false,
                false, false, false, false,
                false, false, false, false,
                false, false, false, false,
            ]
            
            data.follower_periods.forEach(f => {
                
                let from = parseInt(f.from.split(':')[0], 10);
                let to = parseInt(f.to.split(':')[0], 10);

                for( var i=from; i<to; i++ ){
                    periods[i] = true;
                }

            });

            this.setState({
                periods
            })
        });
    }

    sendPeriods(){

        let periods = this.state.periods.map((e,i)=>{

            if( e ){
                return (
                    {
                        from:`${i<10?'0'+i:i}:00`,
                        to:`${i+1<10?'0'+(i+1):i+1}:00`
                    }
                );
            }
            return null;
        })
        .filter(e=>e!=null)
        .reduce(
            (acc,val)=>{

            if( !acc || acc.length===0 ){
                acc = [val]
            } else if( acc[acc.length-1].to === val.from ){
                acc[acc.length-1].to = val.to
            } else {
                acc.push(val)
            }

            return acc
            
        },[]);

        fetch(this.props.reducer.server + "/params/follower/periods", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body:JSON.stringify({
                periods
            })
        })
        .then(d => d.json())
        .then((d) => {});

    }

    clickScedule(t) {
        this.setState({
            periods: this.state.periods.map((e,i)=>t===i?!e:e)
        });

        setTimeout(this.sendPeriods,200);
    }

    render() {
        return (
            <div className="Schedule">

                <div className="content">

                    <h3
                        className="center"
                        style={{
                        margin: 20
                    }}>Plannification des follows</h3>

                    <p className="center">
                        <small>Conseil : sélectionnez au moins 5 heures</small>
                    </p>

                    <div className="row">

                        {Array
                            .apply(null, {length: 4})
                            .map(Number.call, Number)
                            .map((offset,key) => <div key={key}
                                className="col-lg-3 col-md-6 col-xs-12 row"
                                style={{
                                marginTop: 35
                            }}>

                                {Array
                                    .apply(null, {length: 6})
                                    .map(Number.call, Number)
                                    .map(i => <div key={i}
                                        className={`col interval ${this.state.periods[i + 6 * offset]
                                        ? 'active'
                                        : ''}`}
                                        onClick={() => {
                                        this.clickScedule(i + 6 * offset)
                                    }}>
                                        <span className="label">{i + 6 * offset}h</span>
                                    </div>)
}
                            </div>)}
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(state => state)(Schedule);