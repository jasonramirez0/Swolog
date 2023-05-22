import {Sidebar, Menu, MenuItem, useProSidebar} from 'react-pro-sidebar'

import { FiHome, FiLogOut, FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi"

import { Link } from 'react-router-dom'

import './UserSidebar.css'

const UserSidebar = ({setLoggedIn}) => {
    const { collapseSidebar, collapsed } = useProSidebar()
    return (
	    <>
	    <div id="us">
	    <Sidebar id="sidebar">
	    <div className="close-sb" onClick={() => collapseSidebar()}>
	    {!collapsed ? (<FiArrowLeftCircle />) : (<FiArrowRightCircle />)}
	    </div>
	    <Menu id="menu">
	    {/*Home icon should take user to a personalized user home screen, log out button should take user to log in regular home page*/}
	    <div className="menu-container">
	    <MenuItem className="menu-item" component={<Link to="/register" />}> Home </MenuItem>
	    <MenuItem className="menu-item" component={<Link to="/workout-history" />}> Workout History </MenuItem>
	    <MenuItem className="menu-item"> Fitness Progress </MenuItem>
	    </div>
	    </Menu>
	    <div className="logout-button" onClick={() => {
		setLoggedIn(false)
	    }}>
	    <div className="logout-icon">
	    <Link to="/">
	    <FiLogOut />
	    </Link>
	    </div>
	    <div className="logout-text">
	    Logout
	    </div>
	    </div>
	    </Sidebar>
	    
	    </div>
	    </>
    )
}

export default UserSidebar
