const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    _id: String,
    userId: String
}, { collection: 'user' });
const AccessToken = mongoose.model('AccessToken', schema);
module.exports = AccessToken;