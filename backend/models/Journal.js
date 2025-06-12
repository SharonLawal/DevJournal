const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  imageUrl: String,
  relatedLinks: [String],
  notes: String,
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

journalSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

journalSchema.pre('findOneAndUpdate', function(next) {
  this._update.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Journal', journalSchema);