import { useState, useEffect } from 'react'
import exerciseServices from '../services/exercises'
import Table from 'react-bootstrap/Table'
import './ExercisePopularityTable.css'

//Creates a table that displays the 10 most popular exercises based on muscle groups or generally
const ExercisePopularityTable = ({ targetMuscles }) => {
    const [exercises, setExercises] = useState([])
    const [mostPopularExercises, setMostPopularExercises] = useState([])
    const [filteredTargetMuscles, setFilteredTargetMuscles] = useState([])
    const [selectedTargetMuscle, setSelectedTargetMuscle] = useState('')
    
    useEffect(() => {
        // Sets exercises state variable
        const fetchExercises = async () => {
            try {
                const exercisesTemp = await exerciseServices.getAll()
                setExercises(exercisesTemp)
            } catch (error) {
                console.log('Error fetching exercises', error)
            }
        }
       
        //Sets mostPopularExercises state variable
        const fetchMostPopularExercises = async () => {
            try {
                const currentMostPopularExercises = await exerciseServices.getMostPopular()
                setMostPopularExercises(currentMostPopularExercises) 
            } catch (error) {
                console.log('Error fetching most popular exercises', error)
            }
        }

        fetchExercises()
        fetchMostPopularExercises()
    }, [])

    useEffect(() => {
        setFilteredTargetMuscles(targetMuscles)
        const initializeTargetMuscleList = async () => {
            try {
                const mostPopularExercisesMG = await exerciseServices.getMostPopular(targetMuscles[0])
                setMostPopularExercises(mostPopularExercisesMG)
                setSelectedTargetMuscle(targetMuscles[0])
            } catch (error) {
                console.log(`Error getting most popular exercises for ${targetMuscles[0]}`)
            }
        }

        initializeTargetMuscleList()
    }, [targetMuscles])

    const handleTargetMuscleInputChange = async (event) => {
        event.preventDefault()
        const userInputValue = event.target.value.toLowerCase()
        const filteredTargetMusclesTemp = targetMuscles.filter(targetMuscle =>
            targetMuscle.toLowerCase().startsWith(userInputValue)
        )
        setFilteredTargetMuscles(filteredTargetMusclesTemp)

        if (targetMuscles.includes(userInputValue)) {
            try {
                const mostPopularExercisesMG = await exerciseServices.getMostPopular(userInputValue)
                setMostPopularExercises(mostPopularExercisesMG)
                setSelectedTargetMuscle(userInputValue)  
            } catch (error) {
                console.log(`Error getting most popular exercises for ${userInputValue}`)
            }
        } else if (userInputValue === 'general') {
            const mostPopularExercises = await exerciseServices.getMostPopular()
            setMostPopularExercises(mostPopularExercises)
            setSelectedTargetMuscle('')  
        }
    }

    return (
        <div className="exercise-popularity-table">
            <div className='top'>
                <label htmlFor='target-muscle'>Target Muscle: </label>
                <input list="target-muscles-list" 
                        id="target-muscles" 
                        placeholder="Choose a target muscle or type 'general'" 
                        onChange={handleTargetMuscleInputChange}
                />
                <datalist id="target-muscles-list">
                    {filteredTargetMuscles.map( (targetMuscle, index) => (
                        <option key={index} value={targetMuscle}/>
                    ))}
                </datalist>
                <label>{`Selected Target Muscle: ${selectedTargetMuscle}`} </label>
            </div>
            <Table striped>
                <thead>
                    <tr>
                        <th colSpan={3}>
                            Most Popular Exercises
                        </th>
                    </tr>
                    <tr>
                        <th>Rank</th>
                        <th>Exercise Name</th>
                    </tr>
                </thead>
                <tbody>
                    {mostPopularExercises.map((exercise, index) => {
                        return (
                            <tr key={index}> 
                                <td> {index+ 1} </td> 
                                <td key={index}> {exercise} </td> 
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </div>
    )
}

export default ExercisePopularityTable