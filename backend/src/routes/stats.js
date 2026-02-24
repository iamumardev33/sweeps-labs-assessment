const express = require('express');
const fs = require('fs');
const path = require('path');
const { mean } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let cachedStats = null;

// Watch the data file and invalidate cache when modified
fs.watch(DATA_PATH, (eventType) => {
  if (eventType === 'change') {
    cachedStats = null;
  }
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    if (cachedStats) {
      return res.json(cachedStats);
    }

    const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    
    // Calculate stats
    const prices = items.map(item => item.price);
    const stats = {
      total: items.length,
      averagePrice: items.length ? mean(prices) : 0
    };
    
    cachedStats = stats;
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;