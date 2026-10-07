"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
// The one shared Prisma client. Every service imports `db` from here.
exports.db = new client_1.PrismaClient({ log: ['warn', 'error'] });
