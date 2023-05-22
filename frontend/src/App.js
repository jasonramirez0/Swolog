import {
    BrowserRouter as Router,
    Routes, Route, Navigate
} from 'react-router-dom'
import { useEffect, useContext } from 'react'
import UserContext from './UserContext'
import workoutServices from './services/workouts'
import Dashboard from './components/Dashboard'
import Home from './components/Home'
import RegistrationPage from './components/RegistrationPage'
import WorkoutLogPage from './components/WorkoutLogPage'
import WorkoutHistoryPage from './components/WorkoutHistoryPage'

import './index.css'

const App = () => {
    // App state variables and updater functions
    let [user, userDispatch] = useContext(UserContext)
	// Gets logged-in user and token from localStorage if available */
	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedFitnessAppUser');
		if (loggedUserJSON) {
			console.log('logged in user found')
			const currentUser = JSON.parse(loggedUserJSON);
			userDispatch({ type: 'LOG IN', user: currentUser });
			workoutServices.setToken(currentUser.token);
		}
	  }, [userDispatch])

    return (
		<div>
			<Router>	        
				<Routes>
					<Route path="/dashboard" element ={
						user ? ( <Dashboard /> ) : ( <Navigate replace to={"/"} /> )
					}
					/>
					<Route path="/user" element={
						user ? ( <WorkoutLogPage /> ) : ( <Navigate replace to={"/"} /> )
					}
					/>
					<Route path="/register" element={
						user ? ( <Navigate replace to={"/dashboard"} /> ) : ( <RegistrationPage /> )
						}
					/>
					<Route path="/workout-history" element={
						user ? ( <WorkoutHistoryPage /> ) : ( <Navigate replace to={"/"} /> )
						}
					/>
					<Route exact path="/" element={
						!user ? ( <Home /> ) : ( <Navigate replace to={"/dashboard"} /> )
					}
					/> 
				</Routes>
			</Router>
		</div>
    )
}

export default App
