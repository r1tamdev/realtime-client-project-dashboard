"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectHandler = createProjectHandler;
exports.getProjectsHandler = getProjectsHandler;
exports.getProjectByIdHandler = getProjectByIdHandler;
exports.updateProjectHandler = updateProjectHandler;
const project_validation_1 = require("./project.validation");
const projectService = __importStar(require("./project.service"));
const appError_1 = require("../../utils/appError");
const getRequiredParam_1 = require("../../utils/getRequiredParam");
async function createProjectHandler(req, res, next) {
    try {
        const parsed = project_validation_1.createProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new appError_1.AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
        }
        const project = await projectService.createProject(req.user.userId, parsed.data);
        res.status(201).json(project);
    }
    catch (err) {
        next(err);
    }
}
async function getProjectsHandler(req, res, next) {
    try {
        const projects = await projectService.getProjectsForUser(req.user.userId, req.user.role);
        res.status(200).json(projects);
    }
    catch (err) {
        next(err);
    }
}
async function getProjectByIdHandler(req, res, next) {
    try {
        const projectId = (0, getRequiredParam_1.getRequiredParam)(req.params, 'id');
        const project = await projectService.getProjectById(projectId, req.user.userId, req.user.role);
        res.status(200).json(project);
    }
    catch (err) {
        next(err);
    }
}
async function updateProjectHandler(req, res, next) {
    try {
        const projectId = (0, getRequiredParam_1.getRequiredParam)(req.params, 'id');
        const parsed = project_validation_1.updateProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new appError_1.AppError(400, parsed.error.issues[0]?.message ?? 'Invalid input');
        }
        const project = await projectService.updateProject(projectId, req.user.userId, req.user.role, parsed.data);
        res.status(200).json(project);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=project.controller.js.map