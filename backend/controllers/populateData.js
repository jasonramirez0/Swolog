const mongoose = require('mongoose')
const Chance = require('chance')
const bcrypt = require('bcrypt')
const User = require('./../models/user')
const Exercise = require('./../models/exercise')
const { Cluster, Workout } = require('./../models/workout')

// Returns a random exercise from database
async function getRandomExercise() {
  try {
      const randomExercise = await Exercise.aggregate([{ $sample: {size: 1} }])
      return randomExercise[0]
  } catch (error) {
      console.log('Error getting random exercise:', error)
      throw error
  }
}

//Generates synthetic cluster data for testing/demo purposes
async function generateClusterData(numClusters) {
  try {
    let clusterData = []
    for (let i = 0; i< numClusters; i++) {
      const randomExercise = await getRandomExercise()
      const randomWeight = 5*(Math.floor(Math.random()*100) + 1)
      const randomSets = Math.floor(Math.random()*10) + 1
      const randomReps = Math.floor(Math.random()*20) + 1
      const clusterDatum = new Cluster(
        { 
          exercise: randomExercise._id, 
          weight: randomWeight,
          sets: randomSets, 
          reps: randomReps 
        }
        )
      const savedCluster = await clusterDatum.save()
      const updatedExerciseClusters = randomExercise.clusters.concat(savedCluster._id)
      
      await Exercise.findByIdAndUpdate(
        randomExercise._id, {clusters: updatedExerciseClusters}, { new:true }
      )
      
      clusterData.push(savedCluster)
    }
    return clusterData
  } catch (error) {
    console.log('Error generating cluster data:', error)
    throw error
  }
}

//Generates synthetic workout data for testing/demo purposes
async function generateWorkoutData(userID, numWorkouts) {
  const workoutData = []
  const numClusters = 7
  try {
    const startDate = new Date(2023, 0, 1)
    for (let i = 0; i < numWorkouts ; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const clusterData = await generateClusterData(numClusters)
      workoutData.push({ 
        clusters: clusterData, 
        user: userID, 
        createdAt: date 
      })
    }
    const savedWorkouts = await Workout.insertMany(workoutData)
    return savedWorkouts.map(workout => workout._id)
  } catch (error) {
      console.log('Error generating workout data:', error)
      throw error
    }
}

//Generates synthetic user data for testing/demo purposes
async function generateUserData() {
  const chance = new Chance()
  const username = chance.word({ syllables: 2 })
  const name = chance.name()
  //const randomPassword = chance.string({ length: 8, alpha: true, numeric: true, symbols: false })
  const randomPassword = "password"
  const passwordHash = await bcrypt.hash(randomPassword, 10)

  //Creates User and saves to db
  const newUser = new User({ username: username, name: name, passwordHash: passwordHash })
  const savedUser = await newUser.save()
  
  //Creates Workout documents that reference User and updates User document accordingly
  const numWorkouts = 10
  const workoutIDs = await generateWorkoutData(savedUser._id, numWorkouts)

  savedUser.workouts = workoutIDs
  return savedUser
}

async function populateDatabase() {
  const numUsers = 10
  const bulkOps = []
  try {
    // Parallelizes generation of user data
    const generatedUsers = await Promise.all(Array.from({ length: numUsers }, generateUserData))
    //Creates workout update operations for each generated user and makes updates by using User.bulkWrite()
    for (const generatedUser of generatedUsers) {
      const userUpdateOp = {
        updateOne: {
          filter: { _id: generatedUser._id},
          update: { workouts: generatedUser.workouts }
        }
      }
      bulkOps.push(userUpdateOp)
    }
    await User.bulkWrite(bulkOps)
  }
  catch (error) {
      console.log('Error generating users: ', error)
  }
}

module.exports = populateDatabase
