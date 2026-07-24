const { Router } = require("express");
const { create, list, listCustomers, listBugTickets, getOne, retry, approve } = require("../controllers/executionsController.js");

const router = Router();

router.get("/customers", listCustomers);
router.get("/bug-tickets", listBugTickets);
router.post("/executions", create);
router.get("/executions", list);
router.get("/executions/:id", getOne);
router.post("/executions/:id/steps/:stepName/retry", retry);
router.post("/executions/:id/steps/:stepName/approve", approve);

module.exports = router;
