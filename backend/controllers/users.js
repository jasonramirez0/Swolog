const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const populateDatabase = require('./populateData')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('workouts')
    response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
    const id = request.params.id
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body
    const passwordHash = await bcrypt.hash(password, 10)
    try {
      const user = new User({ username, name, passwordHash })
      const savedUser = await user.save()
      response.status(201).json(savedUser)
    } catch (error) {
      console.log('Error creating or saving user:', error)
      response.status(500).json({ error: 'Failed to create or save user.' })
    }
})

module.exports = usersRouter

User.countDocuments()
  .then(count => {
    if (count < 10) {
      populateDatabase()
        .then(() => {
          console.log('Database populated successfully')
        })
        .catch((error) => {
          console.log('Error populating database:', error)
        })
      } else {
        console.log('Database already populated')
      }
    })
    .catch(error => {
      console.log('Error fetching user count:', error)
    })
  