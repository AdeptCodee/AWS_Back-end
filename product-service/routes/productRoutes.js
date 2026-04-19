const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Tạo API chuẩn cho Order Service gọi qua
router.post("/validate", productController.validateProducts);

// Đường dẫn: GET http://localhost:3001/api/products/
router.get("/", productController.getAllProducts);

// 3 API Quản lý sản phẩm (Thêm, Sửa, Xóa)
router.post("/", productController.createProduct); // POST: Thêm mới
router.put("/:id", productController.updateProduct); // PUT: Cập nhật theo ID
router.delete("/:id", productController.deleteProduct); // DELETE: Xóa theo ID
module.exports = router;
