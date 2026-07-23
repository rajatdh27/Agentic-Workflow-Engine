const workflowService = require("../services/workflowService.js");

async function create(req, res, next) {
  try {
    const result = await workflowService.submitRequest(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const result = await workflowService.listExecutions();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function listCustomers(req, res, next) {
  try {
    const result = await workflowService.listCustomers();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const result = await workflowService.getExecutionDetail(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function retry(req, res, next) {
  try {
    const result = await workflowService.retryStep(req.params.id, req.params.stepName);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const result = await workflowService.approveStep(
      req.params.id,
      req.body.decision,
      req.body.note
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports.create = create;
module.exports.list = list;
module.exports.listCustomers = listCustomers;
module.exports.getOne = getOne;
module.exports.retry = retry;
module.exports.approve = approve;
