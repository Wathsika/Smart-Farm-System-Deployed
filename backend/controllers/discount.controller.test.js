import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiscount } from './discount.controller.js';
import Discount from '../models/Discount.js';

function createRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; }
  };
}

// Happy path: valid code
test('validateDiscount returns discount for valid code', async (t) => {
  const now = Date.now();
  const discount = {
    code: 'SAVE10',
    isActive: true,
    startDate: new Date(now - 1000),
    endDate: new Date(now + 1000),
    usageLimit: null,
    timesUsed: 0
  };

  const original = Discount.findOne;
  t.after(() => { Discount.findOne = original; });
  Discount.findOne = async () => discount;

  const req = { body: { code: 'save10' } };
  const res = createRes();
  await validateDiscount(req, res, () => { throw new Error('next called'); });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, discount);
});

// Invalid code
test('validateDiscount rejects unknown code', async (t) => {
  const original = Discount.findOne;
  t.after(() => { Discount.findOne = original; });
  Discount.findOne = async () => null;

  const req = { body: { code: 'INVALID' } };
  const res = createRes();
  await validateDiscount(req, res, () => { throw new Error('next called'); });
  assert.equal(res.statusCode, 404);
});

// Expired discount
test('validateDiscount rejects expired discount', async (t) => {
  const now = Date.now();
  const discount = {
    code: 'OLD',
    isActive: true,
    startDate: new Date(now - 2000),
    endDate: new Date(now - 1000),
    usageLimit: null,
    timesUsed: 0
  };

  const original = Discount.findOne;
  t.after(() => { Discount.findOne = original; });
  Discount.findOne = async () => discount;

  const req = { body: { code: 'OLD' } };
  const res = createRes();
  await validateDiscount(req, res, () => { throw new Error('next called'); });
  assert.equal(res.statusCode, 400);
});

// Usage limit exceeded
test('validateDiscount rejects discount when usage limit exceeded', async (t) => {
  const now = Date.now();
  const discount = {
    code: 'MAXED',
    isActive: true,
    startDate: new Date(now - 1000),
    endDate: new Date(now + 1000),
    usageLimit: 1,
    timesUsed: 1
  };

  const original = Discount.findOne;
  t.after(() => { Discount.findOne = original; });
  Discount.findOne = async () => discount;

  const req = { body: { code: 'MAXED' } };
  const res = createRes();
  await validateDiscount(req, res, () => { throw new Error('next called'); });
  assert.equal(res.statusCode, 400);
});