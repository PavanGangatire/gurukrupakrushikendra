const express = require('express');
const { getIssues, getMyIssues, createIssue, respondToIssue } = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(authorize('admin', 'staff'), getIssues)
    .post(createIssue);

router.route('/myissues').get(getMyIssues);

router.route('/:id/respond').put(authorize('admin', 'staff'), respondToIssue);

module.exports = router;
