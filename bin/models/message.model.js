const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let Message = new Schema({
  message: { type: String, required: true },
  user_id: { type: ObjectId, required: true }
},{
  collection: 'messages',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Message', Message);