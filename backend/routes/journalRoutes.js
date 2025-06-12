const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, journalController.createJournal);
router.get('/', authMiddleware, journalController.getJournals);
router.get('/:id', authMiddleware, journalController.getJournal);
router.put('/:id', authMiddleware, journalController.updateJournal);
router.delete('/:id', authMiddleware, journalController.deleteJournal);

router.post('/upload-image', authMiddleware, upload.single('image'), journalController.uploadImage);

module.exports = router;