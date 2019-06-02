var mongoose = require("mongoose");

var SubjectSchema = new mongoose.Schema({
    name: { type: String },
    credits: { type: String },
    compulsory: { type: String }
});

module.exports = mongoose.model("Subject", SubjectSchema);