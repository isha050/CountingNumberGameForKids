const express = require('express');
const router = express.Router();
const Kid = require('../models/Kid');

router.get('/', async (req, res) => {
  try {
    const kids = await Kid.find().sort({ lastPlayed: -1 });
    res.json(kids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const kid = await Kid.findById(req.params.id);
    if (!kid) {
      return res.status(404).json({ message: 'Kid not found' });
    }
    res.json(kid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const kid = new Kid({
    kidName: req.body.kidName,
  });

  try {
    const newKid = await kid.save();
    res.status(201).json(newKid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/progress', async (req, res) => {
  try {
    const kid = await Kid.findById(req.params.id);
    if (!kid) {
      return res.status(404).json({ message: 'Kid not found' });
    }

    if (req.body.tapLevel !== undefined) kid.tapLevel = req.body.tapLevel;
    if (req.body.countingLevel !== undefined) kid.countingLevel = req.body.countingLevel;
    if (req.body.totalSessions !== undefined) kid.totalSessions = req.body.totalSessions;
    if (req.body.totalCorrect !== undefined) kid.totalCorrect = req.body.totalCorrect;
    kid.lastPlayed = Date.now();

    const updatedKid = await kid.save();
    res.json(updatedKid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;