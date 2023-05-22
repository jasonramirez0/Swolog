import axios from 'axios'
const baseUrl = '/api/exercises'

const getAll  = ()  => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

const getMostPopular = async (muscleGroup = '') => {
    const replacedMuscleGroup = muscleGroup.replace(/ /g, '-')
    const url = `${baseUrl}/popular${muscleGroup.length ? `/${replacedMuscleGroup}` : ''}`
    const response = await axios.get(url)
    return response.data
}

const getTargetMuscles = async () => {
    const response = await axios.get(`${baseUrl}/target-muscles`)
    return response.data
}

export default { getAll, getMostPopular, getTargetMuscles }
