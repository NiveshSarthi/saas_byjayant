const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const { getPolicies, createPolicy, updatePolicy, deletePolicy } = require('../controllers/salesPolicyController');

router.use(authenticate);
router.use(authorize(['HR Manager', 'Accounts', 'Admin']));

router.get('/', getPolicies);
router.post('/', createPolicy);
router.put('/:id', updatePolicy);
router.delete('/:id', deletePolicy);

module.exports = router;




