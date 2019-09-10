const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Message = new Schema({
  message: { type: String, required: true },
  username: { type: String, required: true }
},{
  collection: 'messages',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Message', Message);