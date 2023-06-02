require('dotenv').config()

const PORT = process.env.PORT
console.log(process.env.MONGODB_URI)
const MONGODB_URI = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
const OPEN_API_KEY = process.env.OPEN_API_KEY

module.exports = { MONGODB_URI, PORT, OPEN_API_KEY }
