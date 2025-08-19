const express = require('express');
const router = express.Router();
const { addCow, listCows, getCow, updateCow, deleteCow } = require('../controllers/cow.controller');

router.get('/', listCows);        // list
router.post('/', addCow);         // create
router.get('/:id', getCow);       // display one
router.put('/:id', updateCow);    // edit
router.delete('/:id', deleteCow); // delete

module.exports = router;
