const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema({
    name: String,
    targetMuscles: [String],
    clusters: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cluster'
            }
        ],
        default: []
    }
})

exerciseSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id ? returnedObject._id.toString() : null
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Exercise = mongoose.model('Exercise', exerciseSchema)

module.exports = Exercise
