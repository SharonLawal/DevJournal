const Journal = require('../models/Journal');
const upload = require('../middleware/upload');

const getUserIdFromReq = (req) => {
    return req.user.id;
};

exports.createJournal = async (req, res) => {
  try {
    const { title, content, imageUrl, tags, relatedLinks, notes, reactions } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in or token invalid.' });
    }

    const userId = getUserIdFromReq(req);

    const journal = new Journal({
      title,
      content,
      imageUrl,
      tags,
      relatedLinks,
      notes,
      reactions,
      user: userId
    });

    const saved = await journal.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation failed: ' + messages.join(', ') });
    } else if (err.name === 'CastError' && err.path === 'user') {
        return res.status(400).json({ message: 'Invalid user ID format for journal creation.' });
    }
    res.status(500).json({ message: 'Error creating journal', error: err.message });
  }
};

exports.getJournals = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in or token invalid.' });
    }
    const userId = getUserIdFromReq(req);

    const journals = await Journal.find({ user: userId }).sort({ updatedAt: -1 });
    res.json(journals);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching journals', error: err.message });
  }
};

exports.getJournal = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in or token invalid.' });
    }
    const userId = getUserIdFromReq(req);

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.user.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Journal not found or unauthorized' });
    }

    res.json(journal);
  } catch (err) {
    if (err.name === 'CastError' && err.path === '_id') {
        return res.status(400).json({ message: 'Invalid journal ID format.' });
    } else if (err.name === 'CastError' && err.path === 'user') {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    res.status(500).json({ message: 'Error fetching journal', error: err.message });
  }
};

exports.updateJournal = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in or token invalid.' });
    }
    const userId = getUserIdFromReq(req);

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.user.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Journal not found or unauthorized' });
    }

    const updated = await Journal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation failed: ' + messages.join(', ') });
    } else if (err.name === 'CastError' && (err.path === '_id' || err.path === 'user')) {
        return res.status(400).json({ message: 'Invalid ID format.' });
    }
    res.status(500).json({ message: 'Error updating journal', error: err.message });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in or token invalid.' });
    }
    const userId = getUserIdFromReq(req);

    const journal = await Journal.findById(req.params.id);

    if (!journal || journal.user.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Journal not found or unauthorized' });
    }

    await Journal.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.name === 'CastError' && err.path === '_id') {
        return res.status(400).json({ message: 'Invalid journal ID format.' });
    } else if (err.name === 'CastError' && err.path === 'user') {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }
    res.status(500).json({ message: 'Error deleting journal', error: err.message });
  }
};

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  const imageUrl = req.file.path;

  res.status(200).json({ imageUrl, message: 'Image uploaded successfully.' });
};