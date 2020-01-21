const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
})

playerSchema.virtual('link').get(function () {
    return "http://localhost:3000/api/players/" + this.id
})

module.exports = mongoose.model('Player', playerSchema)