import axios from 'axios'
const baseUrl = '/api/workoutChatbot/message'

const generateWorkout = async description => {
    const response = await axios.post(baseUrl, {muscleGroups: description})
    const parsedData = JSON.parse(response.data.text)
    console.log(parsedData)
    return parsedData
}

export default { generateWorkout }