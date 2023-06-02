const config = require('./utils/config')
const express = require('express')
require('express-async-error')
const app = express()
const cors = require('cors')

const exercisesRouter = require('./controllers/exercises')
const workoutsRouter = require('./controllers/workouts')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const workoutChatbotRouter = require('./controllers/workoutChatbot')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
	    logger.info('connected to MongoDB')
    })
    .catch((error) => {
	    logger.error('error connecting to MongoDB:', error.message)
    })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/exercises', exercisesRouter)
app.use('/api/workouts', workoutsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/workoutChatbot', workoutChatbotRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
