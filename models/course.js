var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CourseSchema = new mongoose.Schema({
    name: { type: String },
    semesters: { type: Number },
    description: { type: String },
    subjects: [
        { type: Schema.Types.ObjectId, ref: 'Subject' }
    ]
});

module.exports = mongoose.model("Course", CourseSchema);