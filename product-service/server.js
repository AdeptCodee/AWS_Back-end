const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Cho phép nhận dữ liệu JSON
app.use(cors());
app.use(express.json());

// 1. Tạo một thông báo thân thiện ở trang chủ
app.get("/", (req, res) => {
  res.send("Product Service đang hoạt động rất tốt!");
});

// 2. Kết nối với file chứa các đường dẫn API của sản phẩm
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Product Service đang chạy tại http://localhost:${port}`);
});
