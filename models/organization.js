var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var OrgSchema = new mongoose.Schema({
    name: { type: String },
    admin: { type: String },
    courses: [
        { type: Schema.Types.ObjectId, ref: 'Course' }
    ],
    subjects: [
        { type: Schema.Types.ObjectId, ref: 'Subject' }
    ],
    logo: { type: String },
    description: { type: String }
});

module.exports = mongoose.model("Organization", OrgSchema);
