// models/UserProfile.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/
    },
    phone: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
