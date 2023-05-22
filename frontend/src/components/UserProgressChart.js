import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import 'chartjs-plugin-annotation';
import workoutServices from '../services/workouts'
import './UserProgressChart.css'

const UserProgressChart = () => {
    const [userExercises, setUserExercises] = useState([])
    const [filteredUserExercises, setFilteredUserExercises] = useState([])
    const [userExerciseClusters, setUserExerciseClusters] = useState([])
    const [currentExercise, setCurrentExercise] = useState('')
    const chartCanvasRef = useRef(null)
    const chartInstanceRef = useRef(null)

    useEffect(() => {
        const fetchUserWorkouts = async () => {
            const userExercisesTemp = await workoutServices.getUserWorkoutExercises()
            setUserExercises(userExercisesTemp)
            setFilteredUserExercises(userExercisesTemp)

            const userExerciseClustersTemp =  await workoutServices.getUserClusters(userExercisesTemp[0].toLowerCase())
            setCurrentExercise(userExercisesTemp[0])
            setUserExerciseClusters(userExerciseClustersTemp)
        }

        fetchUserWorkouts()
    }, [])

    useEffect(() => {
        const renderExerciseChart = () => {
            if (chartInstanceRef.current) {
                // Destroy the existing chart instance if it exists
                chartInstanceRef.current.destroy();
            }
            Chart.register(...registerables);
            const ctx = chartCanvasRef.current.getContext('2d')
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: userExerciseClusters.map( cluster => new Date(cluster.createdAt).toLocaleDateString() ),
                    datasets: [
                        {
                            label: 'Weight',
                            data: userExerciseClusters.map(cluster => cluster.cluster.weight),
                            backgroundColor: 'rgba(0, 275, 275, 0.5)',
                            borderColor: 'rgb(225, 0, 0)',
                            borderCapStyle: 'butt',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(0, 275, 275)',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'linear',
                            beginAtZero: true,
                        },
                    },
                    elements: {
                        point: {
                            radius: 5,
                        }
                    },
                }
            })
            chartInstanceRef.current = chart;
        }

        renderExerciseChart()
    }, [userExerciseClusters])

    const includesIgnoreCase = (array, searchItem) => {
        return array.some(item => item.toLowerCase() === searchItem.toLowerCase())
    }

    const handleExerciseInputChange = async (event) => {  
        event.preventDefault()      
        const userExerciseInputValue = event.target.value.toLowerCase()
        const filteredUserExercisesTemp = userExercises.filter(exercise => 
            exercise.toLowerCase().startsWith(userExerciseInputValue)
        )
        setFilteredUserExercises(filteredUserExercisesTemp)
        if (includesIgnoreCase(userExercises, userExerciseInputValue)) {
            const userExerciseClustersTemp = await workoutServices.getUserClusters(userExerciseInputValue)
            setUserExerciseClusters(userExerciseClustersTemp)
            setCurrentExercise(userExerciseClustersTemp[0].cluster.exercise.name)
        }
    }
    
    return (
        <div className="user-progress" >
            <div className="choose-exercise">
                <label htmlFor="">Exercise: </label>
                <input list="exercises-list"
                        id="exercises" 
                        placeholder='Choose an exercise...' 
                        onChange={handleExerciseInputChange}
                />
                <datalist id="exercises-list">
                    {filteredUserExercises.map( (exercise, index) => (
                        <option key={index}> {exercise} </option>
                    ))}
                </datalist>
                <label id="exercise-label"> {`Current Exercise: ${currentExercise}`}</label>
            </div>
            <div className="user-progress-chart">
                <canvas id="exerciseProgressChart" ref={chartCanvasRef}></canvas>
            </div>
        </div>
    )
}

export default UserProgressChart