"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockRouter = void 0;
const express_1 = require("express");
const stock_service_1 = require("../services/stock.service");
const stock_validator_1 = require("../validators/stock.validator");
exports.stockRouter = (0, express_1.Router)();
exports.stockRouter.post('/stock-adjustments', async (req, res) => {
    const input = stock_validator_1.stockAdjustmentSchema.parse(req.body);
    res.status(201).json(await (0, stock_service_1.adjustStock)(input));
});
exports.stockRouter.get('/stock-movements', async (req, res) => {
    const filter = stock_validator_1.listStockMovementsQuerySchema.parse(req.query);
    res.json(await (0, stock_service_1.listStockMovements)(filter));
});
