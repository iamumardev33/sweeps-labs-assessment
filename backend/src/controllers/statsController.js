const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const { mean } = require('../utils/stats');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;

fs.watch(DATA_PATH, (eventType) => {
  if (eventType === 'change') {
    cachedStats = null;
  }
});

exports.getStats = catchAsync(async (req, res, next) => {
  if (cachedStats) {
    return res.status(200).json(cachedStats);
  }

  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  
  const prices = items.map(item => item.price);
  const stats = {
    total: items.length,
    averagePrice: items.length ? mean(prices) : 0
  };
  
  cachedStats = stats;
  res.status(200).json(stats);
});
