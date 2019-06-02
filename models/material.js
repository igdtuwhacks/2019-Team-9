var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MaterialSchema = new mongoose.Schema({
    name: { type: String },
    file: { type: String },
    guidelines: { type: String },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    assignment: { type: Boolean, default: false }
});

module.exports = mongoose.model("Material", MaterialSchema);