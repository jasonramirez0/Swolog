import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Notification from '../components/Notification'
import { useErrorMessageDispatch } from '../ErrorMessageContext'
import exerciseServices from '../services/exercises'
import workoutServices from '../services/workouts'
import './WorkoutLogPage.css'

// Defines page where a user can log their workout
const WorkoutLogPage = () => {	
	/* UserPage state variables and updater functions */
	const [exercises, setExercises] = useState([])
	const [workout, setWorkout] = useState({})
	const [currWeight, setCurrWeight] = useState(0)
	const [currSets, setCurrSets] = useState(0)
	const [currReps, setCurrReps] = useState(0)
	const [filteredExercises, setFilteredExercises] = useState([])
	const errorMessageDispatch = useErrorMessageDispatch()

	/* Gets and sets all of the exercises from the backend */
	useEffect(() => {
		exerciseServices
			.getAll()
			.then(exercises => {
				setExercises(exercises)
			})
	}, [])

	const handleWeightChange = (event) => {
		event.preventDefault()
		setCurrWeight(event.target.value)
	}
	const handleSetChange = (event) => {	
		event.preventDefault()
		setCurrSets(event.target.value)
	}

	const handleRepChange = (event) => {
		event.preventDefault()
		setCurrReps(event.target.value)
	}

	const addCluster = (event) => {
		event.preventDefault()
		console.log(exercises)	    
		const [exercise, weight, sets, reps] = [
			event.target.elements.exercises.value,
			event.target.elements.weight.value,
			event.target.elements.sets.value,
			event.target.elements.reps.value
		]

		if (!exercises.some( exerciseObject => 
				exerciseObject.name.toLowerCase() === exercise.toLowerCase())
			) {
			errorMessageDispatch( {type: "SET_ERROR", message: "Exercise entered not valid. Please choose an exercise from the provided list."} )
			return
		}

		const newCluster = 
			{
				'exercise': exercise, 
				'weight': weight, 
				'sets': sets, 
				'reps': reps
			}

		/* Creates new workout with this cluster if first cluster of the workout */ 
		if (Object.keys(workout).length === 0) {
			workoutServices
				.create(newCluster)
				.then(createdWorkout => {			
					setWorkout({...createdWorkout})
					console.log(workout.clusters)
				})	    
		} else {
			/* Adds cluster to previously existing workout */		
			const updatedWorkout = {...workout, clusters: workout.clusters.concat(newCluster)}
			workoutServices
				.update(workout.id, updatedWorkout)
				.then(updatedWorkout => {			
					setWorkout(updatedWorkout)
				})
		}
	}

	const ClusterList = () => {  
		if (Object.keys(workout).length === 0) {
			return <label htmlFor="noClustersPrompt"> Add your first exercise for this workout! </label>
		} else {
			return (
				<table>
					<thead>
						<tr>
						<th>Exercise</th>
						<th>Weight</th>
						<th>Sets</th>
						<th>Reps</th>
						</tr>
					</thead>
					<tbody>
						{workout.clusters.map((cluster, index) =>
							<tr key={index}>
								<td>{cluster.exerciseName}</td>
								<td>{cluster.weight}</td>
								<td>{cluster.sets}</td>
								<td>{cluster.reps}</td>
							</tr>
						)}
					</tbody>
				</table>
			)
		}
	}
  
	  const handleExerciseInputChange = (event) => {
		event.preventDefault()
		const userInputValue = event.target.value.toLowerCase()
		const filteredExercisesTemp = exercises.filter( exercise =>
			exercise.name.toLowerCase().startsWith(userInputValue)
		)
		setFilteredExercises(filteredExercisesTemp)
	  }
  
	return (
		<div className="user-main">
			<Header />					
			<div className="user-log">
				<div>
					<h2> Current Workout  </h2>	
				</div>
				<Notification />
				<form onSubmit={addCluster}>		
					<div>
						<label htmlFor="exercise">Exercise</label>
						<input list="exercise-list" id="exercises" 
							placeholder="Type to search..." onChange={handleExerciseInputChange}/>
						<datalist id="exercise-list">
							{filteredExercises.map( exercise => (
								<option key={exercise.id} value={exercise.name} />
							))}
						</datalist>
					</div>
					<div className="sets-reps">
						<div className="weight">
							<label htmlFor="weight">Weight(lbs)</label>
							<select id="weight" value={currWeight} onChange={handleWeightChange}>
								{[...Array(100).keys()].map((num) => (
									<option key={num+1} value={2.5*(num+1)}>
										{2.5*(num + 1)}
									</option>
								))}
							</select>
						</div>
						<div className="sets">
							<label htmlFor="sets">Sets</label>
							<select id="sets" value={currSets} onChange={handleSetChange}>
								{[...Array(20).keys()].map((num) => (
									<option key={num+1} value={num+1}>
										{num + 1}
									</option>
								))}
							</select>
						</div>
						<div className="reps">
							<label htmlFor="reps">Reps</label>
							<select id="reps" value={currReps} onChange={handleRepChange}>
								{[...Array(50).keys()].map((num) => (
									<option key={num+1} value={num+1}>
										{num + 1}
									</option>
								))}
							</select>
						</div>
					</div>
					<button type="submit"> Add </button>
				</form>
				<ClusterList />
			</div>	       
		</div>
	)	
}

export default WorkoutLogPage