const workoutsRouter = require('express').Router()
const { Workout, Cluster } = require('../models/workout')
const User = require('../models/user')
const Exercise = require('../models/exercise')
const jwt = require('jsonwebtoken')

// Gets token from request 'authorization' header
const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
	    return authorization.replace('Bearer ', '')
    }
    return null
}

// Gets user workout list populated with exercise data from Exercise collection
const getWorkouts = async (request, response) => {
    const token = getTokenFrom(request)
    try { 
        if (token) {
            const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
            if (!decodedToken.id) {
                return response.status(401).json({error: 'token invalid'})
            }

            const user = await User.findById(decodedToken.id)
            const workouts = await Workout.find({ user: user.id })
            const populatedWorkouts = await Promise.all(
                workouts.map( async (workout) => {
                    const populatedWorkout = await workout.populate({
                        path: 'clusters',
                        populate: {
                            path: 'exercise',
                            model: 'Exercise'
                        },
                    })
                    return populatedWorkout
                })
            )
            if (request.path === '/') {
                response.json(populatedWorkouts)
            } else if (request.path === '/exercises') {
                    // Extract unique exercises from populated workouts
                    const exercisesSet = new Set()
                    populatedWorkouts.forEach((workout) => {
                        workout.clusters.forEach((cluster) => {
                            exercisesSet.add(cluster.exercise.name)
                        })
                    })
                    const exercises = Array.from(exercisesSet)
                    response.json(exercises)
              } else if (request.path.startsWith('/clusters')) {
                    const exerciseName = request.params.exercise
                    const replacedExerciseName= exerciseName.replace(/_/g, ' ')
                    const clustersAndDate = populatedWorkouts.reduce((result, workout) => {
                        workout.clusters.forEach(cluster => {
                            result = [...result, {
                                cluster: cluster,
                                createdAt: workout.createdAt,
                            }]
                        })
                        return result
                    }, [])

                    const filteredClustersAndDate = clustersAndDate.filter(clusterAndDate =>
                        clusterAndDate.cluster.exercise.name.toLowerCase() === replacedExerciseName
                    )
                    response.json(filteredClustersAndDate)
              }
                else {
                response.status(404).json({ error: 'Invalid path' })
              }
            
        } else {
            const workouts = await Workout.find({})
            response.json(workouts)
        }
    } catch (error) {
        console.error('Error retrieving workouts', error)
        response.status(500).json({error: 'internal server error'})
    }
}

// Retrieves workout list for user
workoutsRouter.get('/', getWorkouts)

// Retrives exercise list containing exercises that user has included in workouts
workoutsRouter.get('/exercises', getWorkouts)

//Retrieves modified user workouts (only clusters and createdAt retrieved) that have clusters with a specified exercise
workoutsRouter.get('/clusters/:exercise', getWorkouts)

workoutsRouter.post('/', async (request, response) => {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
	    return response.status(401).json({ error: 'token invalid' })
    }   
    const user = await User.findById(decodedToken.id)
    const body = request.body
    const exercise = await Exercise.findOne({name: body.exercise})
    const cluster = new Cluster({
        exercise: exercise._id,
        weight: body.weight,
        sets: body.sets,
        reps: body.reps
    })
    const savedCluster = await cluster.save()
    const updatedExerciseClusters = exercise.clusters.concat(savedCluster._id)
    await Exercise.findByIdAndUpdate(
        exercise._id, {clusters: updatedExerciseClusters},{ new:true }
    )
    const workout = new Workout({
        clusters: [cluster],
        user: user.id
    })
    const savedWorkout = await workout.save()
    user.workouts = user.workouts.concat(savedWorkout._id)
    await user.save()    
    const populatedWorkout = await savedWorkout
		  .populate({
		      path: 'clusters',
		      populate: {
			  path: 'exercise',
			  model: 'Exercise'
		      },
		  })
    const modifiedWorkout = {
        id: populatedWorkout._id,
        clusters: populatedWorkout.clusters.map(cluster => ({
            exerciseName: cluster.exercise.name,
            weight: cluster.weight,
            sets: cluster.sets,
            reps: cluster.reps
        }))
    }
    response.json(modifiedWorkout); 
})

workoutsRouter.put('/:id', async (request, response) => {
    console.log('update')
    const body = request.body
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    
    if (!decodedToken.id) {
        console.log('invalid')
        return response.status(401).json({error: 'token invalid'})
    }
    await User.findById(decodedToken.id)
    const clusters = request.body.clusters
    const latestCluster = clusters[clusters.length-1]
    const exercise = await Exercise.findOne({name: latestCluster.exercise})
    const clusterToAdd = new Cluster({
        exercise: exercise._id,
        weight: latestCluster.weight,
        sets: latestCluster.sets,
        reps: latestCluster.reps
    })
    const savedCluster = await clusterToAdd.save()
    const updatedExerciseClusters = exercise.clusters.concat(savedCluster._id)
    await Exercise.findByIdAndUpdate(
        exercise._id, {clusters: updatedExerciseClusters},{ new:true }
    )
    const workout = await Workout.findById(request.params.id)
    const updatedWorkoutClusters = workout.clusters.concat(clusterToAdd)
    const updatedWorkout = await Workout.findByIdAndUpdate(request.params.id, {clusters: updatedWorkoutClusters}, {new: true})
    const populatedWorkout = await updatedWorkout
		  .populate({
		      path: 'clusters',
		      populate: {
                path: 'exercise',
                model: 'Exercise'
		      },
		  })

    const modifiedWorkout = {
        id: populatedWorkout._id,
        clusters: populatedWorkout.clusters.map(cluster => ({
            exerciseName: cluster.exercise.name,
            weight: cluster.weight, 
            reps: cluster.reps, 
            sets: cluster.sets
        }))
    }

    response.json(modifiedWorkout)
})   

module.exports = workoutsRouter

