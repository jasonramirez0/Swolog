const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})


app.get('/', (request, response) => {
    response.send('<h1> Fitness Tracking App </h1>')
})
