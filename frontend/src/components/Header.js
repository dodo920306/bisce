import React, {useContext, useEffect} from 'react'
import { Link } from 'react-router-dom'
//import styled from "styled-components";
import AuthContext from '../context/AuthContext'
import "./Header.css"
import logo from '../images/logo_website.png'

const Header = () => {

    const linkStyle = {
        textDecoration: "none",
        color: 'blue'
      };

    let {user, logoutUser} = useContext(AuthContext)

    return (
        <div className='headerContainer'>
            <ul>    
                <li id='navLogo'><img src={logo} alt="Logo" /></li>
                <li id='navHome'><Link to="/" className='navLink'>Home</Link></li>
                <li id='navTransfer'><Link to="/transfer" className='navLink'>Transfer</Link></li>
                <li id='navLogin'>
                    {user && <span id='welcomeMsg'>Welcome, {user.username} !</span>}
                    {user ? (
                        <button id='logoutButton' onClick={logoutUser}>Logout</button>
                    ): (
                        <Link to="/login" className='navLink'>Login</Link>
                    )}
                </li>
            </ul>
        </div>
    )
}

export default Header