const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readData() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

exports.getAllItems = catchAsync(async (req, res, next) => {
  const data = await readData();
  const { limit, offset, q } = req.query;
  let results = data;

  // SECURITY NOTE: If migrating from `JSON.filter` to a real SQL database (e.g. Postgres), 
  // ensure that the `q` parameter is properly sanitized or parameterized. 
  // DO NOT concatenate `q` directly into raw SQL queries, as it will expose the application 
  // to SQL Injection vulnerabilities. Use an ORM or parameterized queries (e.g., `WHERE name LIKE $1`).
  if (q) {
    results = results.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
  }

  if (limit || offset) {
    const startIndex = offset ? parseInt(offset, 10) : 0;
    const parsedLimit = limit ? parseInt(limit, 10) : results.length;
    results = results.slice(startIndex, startIndex + parsedLimit);
  }

  res.status(200).json(results);
});

exports.getItem = catchAsync(async (req, res, next) => {
  const data = await readData();
  const item = data.find(i => i.id === parseInt(req.params.id));
  
  if (!item) {
    return next(new AppError('Item not found', 404));
  }
  
  res.status(200).json(item);
});

exports.createItem = catchAsync(async (req, res, next) => {
  const item = req.body;
  const data = await readData();
  
  item.id = Date.now();
  data.push(item);
  
  await fs.promises.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
  
  res.status(201).json(item);
});
