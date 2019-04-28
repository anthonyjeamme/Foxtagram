import React from 'react'

import { Link } from 'react-router-dom';
import './Header.css'

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light Header">
      <span className="navbar-brand">

        <Link to="/"><img src="/img/logoline.png" alt="logo" height="35"/></Link>

      </span>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <span className="nav-link">
              <Link to="/stats">
                <button className="navLink">
                  <i className="fas fa-chart-area"></i> <span>Stats</span>
                </button>
              </Link>
              <Link to="/spy">
                <button className="navLink">
                  <i className="fas fa-user-secret"></i> <span>Espion</span>
                </button>
              </Link>
              <Link to="/config">
                <button className="navLink">
                  <i className="fas fa-cog"></i> <span>Config</span>
                </button>
              </Link>
            </span>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Header;
