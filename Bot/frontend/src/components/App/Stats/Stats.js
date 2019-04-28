import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

import Header from '../Header/Header';
import Tile from '../Tile/Tile';

class Stats extends Component {

  constructor(props){
    super(props);

    this.state = {
      flash:null
    }

    this.loadFlashs = this.loadFlashs.bind(this);
  }

componentWillMount(){
    
    this.loadFlashs();

}

loadFlashs(){

  fetch( this.props.reducer.server+"/flashs" )
  .then( response => response.json() )
  .then( flashs=>{

      this.setState({flashs});
  });
}

  render() {

    return ([
      <Header key="header"/>,
      <div className="Stats row" key="body">
      
        <Tile size="lg">

          <h2 className="center">Followers</h2>

          <p><small>
            
            Pendant les 12 dernières heures
            
          </small></p>

          <div style={{
            height:200
          }}>

          {this.state.flashs &&
          <ResponsiveContainer>
            <AreaChart data={this.state.flashs.map(({ date, followers })=>{
              
              let d = new Date(date);

              return ({ date :d, followers:parseInt(followers,10)})
            
            
            })}
                  margin={{top: 10, right: 30, left: 0, bottom: 0}}>
              <XAxis
                dataKey="date"
                />
              <YAxis domain={['auto', 'auto']} interval={1} tickCount={4}/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Tooltip/>
              <Area type='basis' dataKey='followers' stroke='#8884d8' fill='#8884d8' />
            </AreaChart>
            </ResponsiveContainer>
          }
        </div>
      
        </Tile>

      </div>
    ])
  }
}

export default connect(state => state)(Stats);

/*


                <div className="row statusBar">

                    <div className="col-6 text-right">
                        
                        {this.state.scanner_run?<div>
                            
                            <button onClick={this.stopScanner} className="success">Scanner en marche</button>
                        </div>:
                        <div>
                            
                            <button onClick={this.startScanner}>Scanner arrêté</button>
                        </div>}
                        
                    </div>
                    <div className="col-6 text-left">

                        {this.state.follower_run?<div>
                            
                            <button onClick={this.stopFollower} className="success">Follower en marche</button>
                            </div>:<div>
                            
                        <button onClick={this.startFollower}>Follower arrêté</button></div>}

                    </div>
                </div>

                { this.state.stats?<div>

                <div className="jumbotron">

                    <div className="BigNumberLine">
                        <span className="BigNumber">{this.state.stats.init_count}</span> <span>non analysés</span>
                    </div>

                    <div className="BigNumberLine">
                        <span className="BigNumber">{this.state.stats.analyzed_count}</span> <span>en file d'attente</span>
                    </div>

                    <div className="BigNumberLine">
                        <span className="BigNumber">{this.state.stats.followed_today}</span> <span>follow aujourd'hui (+ demandés {this.state.stats.ask_followed_today} = {this.state.stats.followed_today+this.state.stats.ask_followed_today}).</span>
                    </div>
                    <div className="BigNumberLine">

                        <span className="BigNumber">{this.state.stats.unfollowed_today}</span> unfollow aujourd'hui (total {this.state.stats.total_unfollowed}).

                    </div>
                    <div className="BigNumberLine">
                <span className="BigNumber">{this.state.stats.followed_today+this.state.stats.unfollowed_today}</span> actions (follow/unfollow) aujourd'hui.
                </div>

                </div>

                </div>:null}

    	<LineChart style={{margin:"auto"}} width={600} height={300} data={data.slice(data.length-6)}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
       <XAxis dataKey="date" />
       <YAxis/>
       <CartesianGrid strokeDasharray="3 3"/>
       <Tooltip/>
       <Legend />
       <Line type="monotone" dataKey="followers" stroke="#82ca9d" />
      </LineChart>

            <PieChart width={600} height={400} style={{margin:"auto"}} >
        <Pie
          data={data2} 
          cx={300} 
          cy={200} 
          labelLine={false}
          outerRadius={80} 
          fill="#8884d8"
        >
        	{
          	data.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]}/>)
          }
        </Pie>

        <Legend/>
      </PieChart>    
*/
