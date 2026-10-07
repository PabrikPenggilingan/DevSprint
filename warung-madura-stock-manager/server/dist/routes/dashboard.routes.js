"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const dashboard_service_1 = require("../services/dashboard.service");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.get('/', async (_req, res) => {
    res.json(await (0, dashboard_service_1.getDashboard)());
});
