const { submitRequest, listExecutions, listCustomers: listCustomersService, listBugTickets: listBugTicketsService, getExecutionDetail, retryStep, approveStep } = require("../services/workflowService.js");

async function create(req, res, next) {
  try {
    const result = await submitRequest(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const result = await listExecutions();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function listCustomers(req, res, next) {
  try {
    const result = await listCustomersService();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function listBugTickets(req, res, next) {
  try {
    const result = await listBugTicketsService();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const result = await getExecutionDetail(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function retry(req, res, next) {
  try {
    const result = await retryStep(req.params.id, req.params.stepName);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const result = await approveStep(
      req.params.id,
      req.body.decision,
      req.body.note
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, listCustomers, listBugTickets, getOne, retry, approve };
