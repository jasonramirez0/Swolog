import axios from 'axios'
const baseUrl = '/api/workouts'

let token = null

const setToken = newToken => {
    token = `Bearer ${newToken}`
}

const removeToken = () => {
    token = null
}

const create = async newCluster => {
    const config = {
	    headers: { Authorization: token},
    }   
    const response = await axios.post(baseUrl, newCluster, config)
    return response.data
}

const update = async (id, newWorkout) => {
    const config = {
	    headers: { Authorization: token},
    }
    const response = await axios.put(`${baseUrl}/${id}`, newWorkout, config)
    return response.data
}

const get = async ()  => {    
    const config = {
	    headers: { Authorization: token},
    }
    const response = await axios.get(baseUrl, config)
    return response.data
}

const getUserWorkoutExercises = async () => {
    const config = {
        headers: { Authorization: token},
    }
    const response = await axios.get(`${baseUrl}/exercises`, config)
    return response.data
}

const getUserClusters = async (exercise) => {
    const replacedExercise = exercise.replace(/ /g, '_')
    const config = {
        headers: { Authorization: token},
    }
    const response = await axios.get(`${baseUrl}/clusters/${replacedExercise}`, config)
    return response.data
}

export default { create, update, setToken, get, removeToken, getUserWorkoutExercises, getUserClusters }
