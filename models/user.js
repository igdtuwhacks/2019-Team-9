var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    name: { type: String },
    username: { type: String, unique: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: String },
    course: { type: String },
    subject: { type: String },
    phone: { type: Number },
    semester: { type: Number },
    verified: { type: Boolean, default: false }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);