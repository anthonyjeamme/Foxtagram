import React from 'react';

import './Tile.css';

export default ({ children, size="md", textAlign="left", color="white" }) => {
  return (
    <div
    
    style={{textAlign}}
    className={`Tile ${
        size==="xs"?"col-xs-12 col-sm-6 col-md-3":
        size==="md"?"col-xs-12 col-sm-6":
        "col-12"
    } ${color}`}>

        <div className="content">

            {children}

        </div>
    </div>
  )
}
