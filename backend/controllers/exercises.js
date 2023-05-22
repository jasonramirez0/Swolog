const axios = require('axios')
const exercisesRouter = require('express').Router()
const Exercise = require('../models/exercise')
const exercises = require('../exercises')

Exercise.estimatedDocumentCount()
    .then(async function (count) {
		if (count === 0) {	    	    
			exercises.forEach(e => {
			const exercise = new Exercise({...e})
			const savedExercise = exercise.save().then(
				savedExercise => {
					})
			})
		}
		}).catch(function (error) {
		console.log('error')
    })
    		  
exercisesRouter.get('/', async (request, response) => {
    const exercises = await Exercise.find({})
    response.json(exercises)
})

// Gets most popular exercises overall
exercisesRouter.get('/popular', async (request, response) => {
	const mostPopularExercises = await Exercise.find({})
		.sort({ 'clusters.length': -1 })
		.limit(10)
	const mostPopularExerciseNames = mostPopularExercises.map(exercise => exercise.name)
	response.json(mostPopularExerciseNames)
})

//Gets most popular exercises that involve a specified muscle group
exercisesRouter.get('/popular/:muscleGroup', async (request, response) => {
	const muscleGroup = request.params.muscleGroup
	const replacedMuscleGroup = muscleGroup.replace(/-/g, ' ')
	try {
		const mostPopularExercises = await Exercise.find({ targetMuscles: { $in: [replacedMuscleGroup]}})
			.sort({ 'clusters.length': -1})
			.limit(10)
		const mostPopularExerciseNames = mostPopularExercises.map(exercise => exercise.name)
		response.json(mostPopularExerciseNames)
	} catch (error) {
		console.log(`Error retrieving popular exercises for ${muscleGroup}`, error)
		response.status(500).json({ error: 'Internal server error' })
	}
})

//Gets a list (containing no duplicats) of all of the 'target-muscles' that are stored in the Exercise collection
exercisesRouter.get('/target-muscles', async (request, response) => {
	try {
		const exercises = await Exercise.find({})
		const targetMuscles = new Set()

		exercises.forEach( exercise => {
			exercise.targetMuscles.forEach(targetMuscle => {
				targetMuscles.add(targetMuscle)
			})
		})

		const uniqueTargetMuscles = Array.from(targetMuscles)
		return response.json(uniqueTargetMuscles)
	} catch (error) {
		console.log('Error retrieving target muscles', error)
		return response.status(500).json({ error: 'Internal server error'})
	}
})


module.exports = exercisesRouter


