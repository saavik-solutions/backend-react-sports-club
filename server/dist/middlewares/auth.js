"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const roles_1 = require("../config/roles");
const verifyCallback = (req, resolve, reject, requiredRights // Update type here
) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError_1.default('Please authenticate', http_status_1.default.UNAUTHORIZED));
    }
    req.user = user;
    if (requiredRights.length) {
        const userRights = roles_1.roleRights.get(user.role) || [];
        const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
        if (!hasRequiredRights && req.params.userId !== user.id) {
            return reject(new ApiError_1.default('Forbidden', http_status_1.default.FORBIDDEN));
        }
    }
    resolve();
};
const auth = (...requiredRights) => // Update type here
 async (req, res, next) => {
    new Promise((resolve, reject) => {
        passport_1.default.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
        .then(() => next())
        .catch((err) => next(err));
};
exports.default = auth;
