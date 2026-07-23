const { Router } = require("express");
const executionsController = require("../controllers/executionsController.js");

const router = Router();

router.get("/customers", executionsController.listCustomers);
router.post("/executions", executionsController.create);
router.get("/executions", executionsController.list);
router.get("/executions/:id", executionsController.getOne);
router.post("/executions/:id/steps/:stepName/retry", executionsController.retry);
router.post("/executions/:id/steps/:stepName/approve", executionsController.approve);

module.exports = router;
