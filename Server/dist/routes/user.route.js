"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_middleware_1 = require("../middleware/multer.middleware");
const books_controller_1 = require("../controller/books.controller");
const router = (0, express_1.Router)();
router.route("/addBook").post(multer_middleware_1.upload.fields([{ name: "image", maxCount: 1 }]), books_controller_1.createBook);
exports.default = router;
