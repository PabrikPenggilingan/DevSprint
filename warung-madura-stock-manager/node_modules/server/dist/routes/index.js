"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const dashboard_routes_1 = require("./dashboard.routes");
const product_routes_1 = require("./product.routes");
const sale_routes_1 = require("./sale.routes");
const stock_routes_1 = require("./stock.routes");
// Everything below is mounted under /api (see app.ts).
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.use('/products', product_routes_1.productRouter);
exports.apiRouter.use('/sales', sale_routes_1.saleRouter);
exports.apiRouter.use('/dashboard', dashboard_routes_1.dashboardRouter);
exports.apiRouter.use('/', stock_routes_1.stockRouter); // /stock-adjustments and /stock-movements
