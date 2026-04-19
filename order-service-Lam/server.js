const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const oracledb = require("oracledb");
require("dotenv").config();
const { getConnection } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Chào mừng đến với Order Service!",
    status: "Đang hoạt động ổn định ",
  });
});

// 1. API ĐẶT HÀNG (Dùng lệnh PUT để cập nhật kho)
app.post("/api/orders", async (req, res) => {
  const { customerName, items, userId = 1 } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống!" });
  }

  let conn;
  try {
    console.log(`Đang kiểm tra kho hàng cho ${customerName}...`);

    // BƯỚC 1: Gọi sang Product Service để hỏi hàng (Lấy số lượng tồn kho và giá tiền)
    const response = await fetch(
      `${process.env.PRODUCT_SERVICE_URL}/api/products/validate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items }),
      },
    );

    const productData = await response.json();

    // Nếu hết hàng hoặc không tồn tại thì báo lỗi ngay
    if (productData.valid !== true) {
      return res.status(400).json({
        message: "Rất tiếc, sản phẩm không tồn tại hoặc không đủ hàng!",
        details: productData.items,
      });
    }

    // BƯỚC 2: Tận dụng API Sửa (PUT) để trừ kho từng món một
    console.log("Hàng còn đủ, tiến hành cập nhật lại số lượng kho...");

    for (const product of productData.items) {
      // Tìm xem khách mua mấy cái cho món này
      const orderedItem = items.find(
        (i) => Number(i.productId) === Number(product.id),
      );

      // Tính toán số lượng kho mới sau khi bán
      const newStock = product.stock - orderedItem.quantity;

      // Gọi API PUT sang Máy 01 để lưu lại số lượng mới
      const updateResponse = await fetch(
        `${process.env.PRODUCT_SERVICE_URL}/api/products/${product.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: product.name, // Gửi lại tên cũ
            price: product.price, // Gửi lại giá cũ
            stock: newStock, // GỬI SỐ LƯỢNG KHO MỚI ĐÃ TRỪ
            category_id: product.category_id, // Gửi lại ID danh mục
            product_image: product.product_image, // Gửi lại link ảnh
          }),
        },
      );

      if (!updateResponse.ok) {
        return res.status(500).json({
          message: `Lỗi khi cập nhật kho cho sản phẩm: ${product.name}`,
        });
      }
    }

    // BƯỚC 3: Trừ kho thành công -> Tính tiền và chuẩn bị dữ liệu lưu Order
    console.log(
      "Cập nhật kho thành công! Bắt đầu tính tiền và lưu đơn hàng...",
    );
    let totalPrice = 0;
    const validItemsForInsert = [];

    productData.items.forEach((product) => {
      const orderedItem = items.find(
        (i) => Number(i.productId) === Number(product.id),
      );
      const quantity = orderedItem.quantity;
      totalPrice += product.price * quantity;

      validItemsForInsert.push({
        productId: product.id,
        quantity: quantity,
        price: product.price,
      });
    });

    // BƯỚC 4: Mở kết nối Oracle và chạy Transaction để lưu 2 bảng
    conn = await getConnection();
    const newOrderId = uuidv4();

    // Bảng 1: orders
    await conn.execute(
      `INSERT INTO orders (id, user_id, total_price, status) VALUES (:id, :userId, :price, 'CONFIRMED')`,
      [newOrderId, userId, totalPrice],
      { autoCommit: false },
    );

    // Bảng 2: order_items
    for (const item of validItemsForInsert) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (:orderId, :productId, :qty, :price)`,
        [newOrderId, item.productId, item.quantity, item.price],
        { autoCommit: false },
      );
    }

    await conn.commit(); // Chốt giao dịch

    console.log("Đã lưu đơn hàng thành công!");
    return res.status(201).json({
      message: "Đặt hàng thành công và kho đã được cập nhật!",
      orderId: newOrderId,
      total: totalPrice,
    });
  } catch (error) {
    console.error("Lỗi xử lý đơn hàng:", error);
    if (conn) {
      try {
        await conn.rollback();
      } catch (e) {} // Hủy lưu Order nếu có lỗi
    }
    return res.status(500).json({ message: "Lỗi hệ thống Server" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Order Service đang chạy tại http://localhost:${PORT}`);
});
// 1. API: Lấy danh sách tất cả đơn hàng
app.get("/api/orders", async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM orders ORDER BY created_at DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
  } finally {
    if (conn) await conn.close();
  }
});

// 2. API: Lấy chi tiết một đơn hàng (Bao gồm thông tin chung và các món đã mua)
app.get("/api/orders/:id", async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const orderId = req.params.id;

    // Lấy thông tin chung từ bảng orders
    const orderResult = await conn.execute(
      `SELECT * FROM orders WHERE id = :id`,
      [orderId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Lấy danh sách các món hàng từ bảng order_items
    const itemsResult = await conn.execute(
      `SELECT * FROM order_items WHERE order_id = :id`,
      [orderId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const fullOrder = orderResult.rows[0];
    fullOrder.items = itemsResult.rows;

    res.json(fullOrder);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết đơn hàng" });
  } finally {
    if (conn) await conn.close();
  }
});

// API: Cập nhật trạng thái đơn hàng (Chỉ đổi trạng thái, không can thiệp kho)
app.patch("/api/orders/:id/status", async (req, res) => {
  let conn;
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    conn = await getConnection();

    // Chỉ thực hiện cập nhật cột status trong bảng orders của Máy 02
    const result = await conn.execute(
      `UPDATE orders SET status = :status WHERE id = :id`,
      [status, orderId],
      { autoCommit: true },
    );

    // Kiểm tra xem ID đơn hàng có tồn tại trong hệ thống không
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng để cập nhật" });
    }

    // Trả về thông báo thành công 
    res.json({
      message: `Cập nhật trạng thái thành ${status} thành công!`,
    });
    
  } catch (error) {
    console.error("Chi tiết lỗi Update Status:", error);
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  } finally {
    if (conn) await conn.close();
  }
});