import { useState } from 'react'
import workoutServices from '../services/workouts'
import './WorkoutHistoryPage.css'
import Header from './Header'
import maleHumanBodyImage from '../maleHumanBodyImage.png'
import maleHumanBodyBackImage from '../maleHumanBodyBackImage.png'

import { targetFrontMusclePoints, targetBackMusclePoints } from './targetMusclePoints'

//Displays front and back human body images and highlights specified muscle groups using <polygon> elements
const HumanBody = ({ targetMusclesUsed }) => {
	return (
		<div className="image-container">
			<div className="image-wrapper">
				<img src={maleHumanBodyImage} alt="Male Human Body"/>
				
			</div>
			<div className="back-image-wrapper">
				<img src={maleHumanBodyBackImage} alt="Male Human Body Back"/>
			</div>

			<svg className="highlight" viewBox="0 0 430 750"
				style={{top: '48px', left: '0px', width: '372px', height: '650px'}}
			>
				{Object.entries(targetMusclesUsed).map(([key, value]) => {
					return (
						<polygon
							key={key}
							points={targetFrontMusclePoints[key]}
							fill="red"
							stroke="rgb(0,0,225)"
							strokeWidth="2"
						/>
					)
				})}
			</svg>
			<svg className="highlight" viewBox="0 0 430 750"
					style={{ top: '49px', left: '399px', width: '372px', height: '650px' }}
				>
				{Object.entries(targetMusclesUsed).map(([key, value]) => {
					return (
						<polygon
							key={key}
							points={targetBackMusclePoints[key]}
							fill="red"
							stroke="rgb(0,0,225)"
							strokeWidth="2"
						/>
					)
				})}
	        </svg>
	    </div>
	)
}

/* Allows user to select a workout and displays a list of selectable exercises for the selected workout,
along with human body images that highlight the muscle groups used for a selected exercise */
const WorkoutHistoryPage = () => {
	//Defines state variables and updater functions
    const [openDropdown, setOpenDropdown] = useState(false)
    const [prevWorkouts, setPrevWorkouts] = useState([])
    const [selectedWorkout, setSelectedWorkout] = useState(null)
    const [targetMusclesUsed, setTargetMusclesUsed] = useState({})
	const [selectedRow, setSelectedRow] = useState(-1)
    
	//Shows or hides 'dropdown' list of user's workouts (if any)
    const handleDropdownClick = async () => {
		setOpenDropdown(!openDropdown)
		const userWorkouts = await workoutServices.get()
		if (userWorkouts.length !== 0) {
			setPrevWorkouts(userWorkouts)
			setSelectedWorkout(userWorkouts[0])
		}    
    }

	//Selects the workout from the Dropdown list
    const handleSelectedWorkoutChange = (event) => {
		const newSelectedWorkout = prevWorkouts.find((workout) => workout.id === event.target.value)
		setSelectedWorkout(newSelectedWorkout)
    }
    
	// 'dropdown' list that displays a list of saved user workouts
    const Dropdown = ({open, trigger}) => {
		return (
			<>
				{trigger}
				{open ? (
					<ul>
						<select name="previous-workouts" id="previous-workouts" value={selectedWorkout ? selectedWorkout.id : ''} onChange={handleSelectedWorkoutChange}>
							{prevWorkouts.map((workout, index) =>
								<option key={workout.id} value={workout.id}> 
									{workout.createdAt} 
								</option>)
							}
						</select>
					</ul>
				) : null}
			</>
		)
    }

	/* When user selects an exercise from the workout, this function handler sets the exercise 'targetMuscles' in the setTargetMusclesUsed hashmap to 'true' 
	Also selects the corresponding row of the exercise using the index */
    const handleExerciseSelection = (exercise, index) => {
		const newTargetMusclesUsed = {}
		exercise.targetMuscles.map( targetMuscle => {
			if (targetMuscle === 'left forearm' || targetMuscle === 'right forearm') {
				newTargetMusclesUsed[targetMuscle.concat(' back')] = true
			} else if(targetMuscle === 'upper traps') {
				newTargetMusclesUsed[targetMuscle.concat(' front right')] = true
				newTargetMusclesUsed[targetMuscle.concat(' front left')] = true
			} else if(targetMuscle === 'right calf' || targetMuscle === 'left calf') {
				newTargetMusclesUsed[targetMuscle.concat(' front right')] = true
				newTargetMusclesUsed[targetMuscle.concat(' front left')] = true
			}
			newTargetMusclesUsed[targetMuscle] = true
		})
		setTargetMusclesUsed(newTargetMusclesUsed)
		setSelectedRow(index)
    }
    
    return (
     	 <div className="wh-main">
			<Header />
			<div className="workout-display">
				<div className="prev-workouts">
					<Dropdown
						open={openDropdown}
						trigger={<button onClick={handleDropdownClick}> Previous Workouts </button>}
					/>
					{selectedWorkout === null ? <label> Choose a workout  </label> :
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
								{selectedWorkout.clusters.map( (cluster, index) => (
									<tr key={cluster.id} className={selectedRow === index ? 'table-row-highlighted' : ''}  onClick={() => handleExerciseSelection(cluster.exercise, index)}>
										<td className="label">{cluster.exercise.name}</td>
										<td className="label">{cluster.weight}</td>
										<td className="label">{cluster.sets}</td>
										<td className="label">{cluster.reps}</td>						
									</tr>
								))}
							</tbody>
						</table>						     	
					}	    
				</div>
				<div className="human-body">
					<HumanBody targetMusclesUsed={targetMusclesUsed}/>
				</div>
			</div>
		</div>
	)
}

export default WorkoutHistoryPage
