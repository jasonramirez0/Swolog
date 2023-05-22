import Header from './Header'
import { useState, useEffect } from 'react'
import { useUserValue } from '../UserContext'
import ExercisePopularityTable from './ExercisePopularityTable'
import UserRankingsTable from './UserRankingsTable'
import UserProgressChart from './UserProgressChart'
import exerciseServices from '../services/exercises'
import './Dashboard.css'

const Dashboard = () => {
    // Gets 'user' state variable from UserContext
    const user = useUserValue()

    /* Declares and initalizes 'targetMuscles' state variable
    that stores a list of target muscle strings */
    const [targetMuscles, setTargetMuscles] = useState([])

     // Fetches target muscles from backend and 
     // sets targetMuscles state variable    
     useEffect(() => {
        const fetchTargetMuscles = async () => {
            try {
                // Fetches target muscle from backend
                const targetMusclesTemp = await exerciseServices.getTargetMuscles()
                setTargetMuscles(targetMusclesTemp)
            } catch (error) {
                console.log('Error fetching target muscles', error)
            }
        }
        fetchTargetMuscles()
    }, [])

    return (
        <div className="dashboard">
            <Header />
            <h1 className="welcome-header"> {`Welcome, ${user.username}!`}</h1>
            <div className="exercise-tables">
                <ExercisePopularityTable targetMuscles={targetMuscles} />
                <UserProgressChart />
            </div>        
       </div>
    )
}

export default Dashboard