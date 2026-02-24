const request = require('supertest');
const express = require('express');
const itemsRouter = require('../src/routes/items');

// Mock Express App
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

describe('Items Routes', () => {

  it('GET /api/items should return a full list of items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0); // Assuming items.json has data
  });

  it('GET /api/items with limit should return exactly the limit', async () => {
    const limit = 5;
    const res = await request(app).get(`/api/items?limit=${limit}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(limit);
  });

  it('GET /api/items with limit and offset', async () => {
    // get first two
    const res1 = await request(app).get(`/api/items?limit=2`);
    expect(res1.status).toBe(200);
    
    // get third item
    const res2 = await request(app).get(`/api/items?limit=1&offset=2`);
    expect(res2.status).toBe(200);

    // fetch all and manually slice
    const resAll = await request(app).get(`/api/items`);
    
    expect(res1.body[0].id).toBe(resAll.body[0].id);
    expect(res1.body[1].id).toBe(resAll.body[1].id);
    expect(res2.body[0].id).toBe(resAll.body[2].id);
  });

  it('GET /api/items with search query (q)', async () => {
    const allRes = await request(app).get(`/api/items`);
    const searchTarget = allRes.body[0].name.substring(0, 3); // grab prefix to search

    const res = await request(app).get(`/api/items?q=${searchTarget}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name.toLowerCase()).toContain(searchTarget.toLowerCase());
  });

  it('GET /api/items/:id should return a specific item', async () => {
    const allRes = await request(app).get(`/api/items`);
    const target = allRes.body[0];

    const res = await request(app).get(`/api/items/${target.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(target.id);
    expect(res.body.name).toBe(target.name);
  });

  it('GET /api/items/:id should return 404 for non-existent item', async () => {
    const res = await request(app).get('/api/items/999999999'); // Assumed non-existent
    expect(res.status).toBe(404); // Default express behavior throws 500 without custom errorHandler if not caught, but error has err.status = 404
  });

  it('POST /api/items should create an item', async () => {
    const payload = {
      name: 'Test Setup Box',
      price: 13.37,
      category: 'Test'
    };

    const res = await request(app)
      .post('/api/items')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(payload.name);
    expect(res.body).toHaveProperty('id');
  });

});
