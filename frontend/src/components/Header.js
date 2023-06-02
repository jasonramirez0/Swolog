// -*- mode: web-mode -*-
import './Header.css'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import UserContext from '../UserContext'
import workoutServices from '../services/workouts'
import { FiLogOut } from 'react-icons/fi'

const Header = () => {

    const [user, userDispatch] = useContext(UserContext)

    const handleLogout = () => {
        if (!user) {
            return
        }
        try {
            userDispatch({ type: "LOG OUT" })
            workoutServices.removeToken()
            window.localStorage.removeItem('loggedFitnessAppUser')
        } catch (error) {
        }
    }

    return (
      <header className="header-container">
          <h1 className="app-name">Swolog</h1>
          <div className="right-header">
            <nav className="nav-menu">
                <ul>
                    {user ? (
                        <>
                            <li> <Link to="/dashboard">Dashboard</Link></li>
                            <li> <Link to="/user">Add a Workout</Link></li>
                            <li> <Link to="/workout-history">Workout History</Link></li>
                        </>
                    ) : (
                        <>
                            <li> <Link to="/register">Register</Link></li>
                        </>
                    )}
                </ul>
            </nav>
            <div className="logout">
                <FiLogOut id="logout-button" onClick={handleLogout}/>
                <span style={{ display: 'inline-block', color: 'white', fontSize: '20px'}}>Logout</span>
            </div>
        </div>
      </header>      
    )
}

export default Header
