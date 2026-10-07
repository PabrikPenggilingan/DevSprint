"use strict";
// Errors thrown by services. The error handler middleware turns them into HTTP responses.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    status;
    code;
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = new.target.name;
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = 'Data tidak ditemukan.') {
        super(404, 'NOT_FOUND', message);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(409, 'CONFLICT', message);
    }
}
exports.ConflictError = ConflictError;
