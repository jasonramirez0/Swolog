import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Notification from '../components/Notification'
import { useErrorMessageDispatch } from '../ErrorMessageContext'
import exerciseServices from '../services/exercises'
import workoutServices from '../services/workouts'
import workoutChatbotServices from '../services/workoutChatbot'
import { useRef } from 'react'
import { Trash } from 'react-bootstrap-icons'
import './WorkoutLogPage.css'

// Defines page where a user can log their workout
const WorkoutLogPage = () => {	
	/* UserPage state variables and updater functions */
	const [exercises, setExercises] = useState([])
	const [workout, setWorkout] = useState({clusters: []})
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
		
		if (workout.clusters.length !== 0) {
			setWorkout({clusters: [...workout.clusters, newCluster]})
		} else {
			setWorkout({clusters: [newCluster]})
		}
	}

	const removeCluster = (index) => {
		setWorkout({clusters: [...workout.clusters.slice(0, index), ...workout.clusters.slice(index+1)]})
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
								<td>{cluster.exercise}</td>
								<td>{cluster.weight}</td>
								<td>{cluster.sets}</td>
								<td>{cluster.reps}</td>
								<td>
									<Trash className="trash-icon" onClick={() => removeCluster(index)}/>
								</td>
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

	  const saveWorkout = async (event) => {
		event.preventDefault()
		console.log('save workout')
		try {
			await workoutServices.create(workout.clusters)
			setWorkout({clusters: []})
		} catch (error) {
			console.log('error saving workout')
		}
	  }

	  // Implements chat interface through which user can specify workout parameters and get a workout generated via ChatGPT
	  const ChatInterface = () => {
		const [chatMessages, setChatMessages] = useState(['Hi there! I\'m ChatGPTrainer. Specify the type of workout you want me to generate (target muscles, intensity, your physical condition, etc.) '])
		const [currentChatMessage, setCurrentChatMessage] = useState('')
		const [generatedClusters, setGeneratedClusters] = useState([])

		const messagesEndRef = useRef(null)
		const scrollToBottom = () => {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth"})
		}
		useEffect(scrollToBottom, [chatMessages])

		const handleChatInputChange = (event) => {
			event.preventDefault()
			setCurrentChatMessage(event.target.value)
		}
		
		// Handles different user message input provided via the chat interface
		const sendChatMessage = async (event) => {
			event.preventDefault()

			// Workout has already been generated, in this case user may either add or clear current generated workout
			if (generatedClusters.length !== 0) {
				const userCommand = currentChatMessage.toLowerCase()
				if (userCommand === 'add') {
					try {
						workoutServices
							.create(generatedClusters)
							.then(createdWorkout => {	
								const generatedClusters = createdWorkout.clusters.map(cluster => (
									{exercise: cluster.exerciseName, ...cluster}
								))		
								setWorkout({ clusters: generatedClusters })
							})	
					} catch (error) {
						console.log('error adding generated workout')
					}
					console.log('generated workout successfully added')
					setGeneratedClusters([])
				}
				// Clears most recently generated workout
				else if (userCommand === 'clear') {
					setGeneratedClusters([])
					setChatMessages((prevChatMessages) => [...prevChatMessages, 'Specify the type of workout you want me to generate (target muscles, intensity, your physical condition, etc.)'])
				}
				// Handles invalid entries
				else {
					setChatMessages((prevChatMessages) => [...prevChatMessages, 'Invalid entry.'])
					setChatMessages((prevChatMessages) => [...prevChatMessages, 'Type \'add\' to add this workout to your current workout, or \`clear\` to generate a new one'])
				}
				return
			}
			// Handles case of when workout has not been generated yet and chatGPTrainer is waiting for user specifications about their desired workout
			setChatMessages((prevChatMessages) => [...prevChatMessages, currentChatMessage])
			setChatMessages((prevChatMessages) => [...prevChatMessages, "Please wait while I generate your personalized workout..."])
			setCurrentChatMessage('')
			const generatedWorkout = await workoutChatbotServices.generateWorkout(currentChatMessage)
			const modifiedGeneratedWorkout = generatedWorkout.map(cluster => {
				const currExercise = cluster.exerciseName
				const weight = cluster['weight in lbs']
				const sets = cluster.sets
				const reps = cluster.reps
				return {exercise: currExercise, weight: weight, sets: sets, reps: reps}
			})
			setGeneratedClusters(modifiedGeneratedWorkout)
			const exerciseMessages = modifiedGeneratedWorkout.map(cluster => {
				return `Exercise: ${cluster.exercise} weight: ${cluster.weight}lbs sets: ${cluster.sets} reps: ${cluster.reps}`
			})
			setChatMessages((prevChatMessages) => [...prevChatMessages, ...exerciseMessages])
			setChatMessages((prevChatMessages) => [...prevChatMessages, 'Is this workout to your liking? If so let me know so I can add it to your current workout'])
			setChatMessages((prevChatMessages) => [...prevChatMessages, 'Type \'add\' to add this workout to your current workout, or \`clear\` to generate a new one'])
		}

		return (
			<div className="chat-interface">
				<h3>ChatGPTrainer</h3>
				<div className="chat-messages" style={{ overflow: 'auto', height: '350px' }}>
					{chatMessages.map((message, index) => (
						<p key={index}>{message}</p>
					))}
					<div ref={messagesEndRef} />
				</div>
				<form id="message-form" onSubmit={sendChatMessage} style={{display: 'flex'}}>
					<input type="text" value={currentChatMessage} onChange={handleChatInputChange} placeholder="Type your message..." />
					<button type="submit">Send</button>
				</form>
			</div>
		)
	  }
  
	return (
		<div className="user-main">
			<Header />
			<div className="log-chat">			
				<div className="user-log">
					<div>
						<h2>Current Workout</h2>	
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
					{workout.clusters.length !== 0 &&
						<button id="save-workout-button" onClick={saveWorkout} type="submit">Save Workout</button>
					}
				</div>	
				<ChatInterface />
			</div>       
		</div>
	)	
}

export default WorkoutLogPage