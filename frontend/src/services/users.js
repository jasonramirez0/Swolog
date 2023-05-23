import axios from 'axios'
const baseUrl = '/api/users'

let token = null

const setToken = newToken => {
    token = `Bearer ${newToken}`
}

const getUserWorkouts = async userId => {
    const userWorkouts = await axios.get(`${baseUrl}/${userId}`)
    
}
