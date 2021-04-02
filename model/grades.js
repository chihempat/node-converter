const mongoose = require('mongoose')
const Schema = require('mongoose').Schema

const GradesSchema = new Schema({
    lastName: String,
    firstName: String,
    ssn: String,
    test1: Number,
    test2: Number,
    test3: Number,
    test4: Number,
    final: Number,
    grade: String
}, { collection: 'grades' })

module.exports = mongoose.model('Grades', GradesSchema);