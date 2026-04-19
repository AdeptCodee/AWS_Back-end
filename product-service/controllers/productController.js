const { getConnection } = require("../config/database");
const oracledb = require("oracledb");

// const validateProducts = async (req, res) => {
//   let conn;
//   try {
//     // 1. Nhận danh sách Lâm gửi (ví dụ: [{ productId: 1, quantity: 2 }])
//     const itemsRequested = req.body.items;

//     if (!itemsRequested || itemsRequested.length === 0) {
//       return res.status(400).json({ valid: false, message: "Danh sách trống" });
//     }

//     // 2. Mở cửa kết nối vào Oracle
//     conn = await getConnection();

//     let validItems = [];
//     let errorItems = [];

//     // 3. Vòng lặp đi kiểm tra từng món hàng
//     for (let i = 0; i < itemsRequested.length; i++) {
//       let item = itemsRequested[i];

//       // Truy vấn lấy thông tin linh kiện từ Oracle
//       // outFormat giúp dữ liệu trả về dạng Object cho dễ đọc
//       const result = await conn.execute(
//         `SELECT id, name, price, stock FROM products WHERE id = :id`,
//         [item.productId],
//         { outFormat: oracledb.OUT_FORMAT_OBJECT },
//       );

//       // Kiểm tra các trường hợp
//       if (result.rows.length === 0) {
//         // Không tìm thấy sản phẩm
//         errorItems.push({
//           productId: item.productId,
//           reason: "PRODUCT_NOT_FOUND",
//         });
//       } else {
//         // Tìm thấy, Oracle mặc định trả về tên cột viết HOA
//         let productInDB = result.rows[0];

//         if (productInDB.STOCK < item.quantity) {
//           // Hết hàng hoặc không đủ số lượng
//           errorItems.push({
//             productId: item.productId,
//             reason: "OUT_OF_STOCK",
//           });
//         } else {
//           // Hợp lệ, thêm vào danh sách chuẩn bị gửi về cho Lâm
//           validItems.push({
//             id: productInDB.ID,
//             name: productInDB.NAME,
//             price: productInDB.PRICE,
//             stock: productInDB.STOCK,
//           });
//         }
//       }
//     }

//     // 4. Trả kết quả cuối cùng
//     if (errorItems.length > 0) {
//       return res.json({
//         valid: false,
//         message: "One or more products are invalid",
//         errors: errorItems,
//       });
//     }

//     return res.json({
//       valid: true,
//       items: validItems,
//     });
//   } catch (error) {
//     console.error("Lỗi:", error);
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   } finally {
//     // Luôn nhớ đóng cửa kết nối Oracle khi làm xong
//     if (conn) {
//       try {
//         await conn.close();
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   }
// };

// Hàm lấy toàn bộ danh sách sản phẩm
const getAllProducts = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    // Thực hiện truy vấn lấy tất cả sản phẩm
    // Chúng ta lấy thêm tên danh mục bằng cách nối (JOIN) với bảng categories
    const result = await conn.execute(
      `SELECT p.id, p.name, p.price, p.stock, p.product_image, c.name as category_name 
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // Trả về danh sách sản phẩm cho Frontend
    return res.json(result.rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

// Hàm thêm sản phẩm mới
const createProduct = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const data = req.body;

    // Bước 1: Kiểm tra xem dữ liệu gửi lên là 1 sản phẩm hay 1 danh sách
    const products = Array.isArray(data) ? data : [data];
    const results = [];

    // Bước 2: Dùng vòng lặp để xử lý từng sản phẩm trong danh sách
    for (const product of products) {
      const { name, price, stock, category_id, product_image } = product;

      const result = await conn.execute(
        `INSERT INTO products (name, price, stock, category_id, product_image) 
         VALUES (:name, :price, :stock, :category_id, :product_image)`,
        [name, price, stock, category_id, product_image],
        { autoCommit: false },
      );
      results.push(result);
    }

    // Bước 3: Sau khi chạy xong vòng lặp, lưu tất cả vào Database
    await conn.commit();

    return res.status(201).json({
      message: `Đã thêm thành công ${products.length} sản phẩm!`,
      count: products.length,
    });
  } catch (error) {
    if (conn) await conn.rollback(); // Nếu có 1 món lỗi, hủy bỏ toàn bộ để tránh sai sót
    console.error("Lỗi khi thêm sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi thêm sản phẩm" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

// Hàm sửa thông tin sản phẩm
const updateProduct = async (req, res) => {
  let conn;
  try {
    // Lấy ID từ đường dẫn (ví dụ: /api/products/5 -> ID là 5)
    const productId = req.params.id;

    // Lấy các thông tin mới muốn sửa
    const { name, price, stock, category_id, product_image } = req.body;

    conn = await getConnection();

    const result = await conn.execute(
      `UPDATE products 
             SET name = :name, price = :price, stock = :stock, category_id = :category_id, product_image = :product_image 
             WHERE id = :id`,
      [name, price, stock, category_id, product_image, productId],
      { autoCommit: true },
    );

    // rowsAffected là số dòng dữ liệu bị thay đổi. Nếu bằng 0 nghĩa là không tìm thấy ID đó.
    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để sửa" });
    }

    return res.json({ message: "Cập nhật sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi sửa sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi sửa sản phẩm" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

// Hàm xóa sản phẩm
const deleteProduct = async (req, res) => {
  let conn;
  try {
    const productId = req.params.id;

    conn = await getConnection();

    const result = await conn.execute(
      `DELETE FROM products WHERE id = :id`,
      [productId],
      { autoCommit: true },
    );

    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để xóa" });
    }

    return res.json({ message: "Xóa sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi xóa sản phẩm" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const validateProducts = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    // 1. Nhận danh sách đồ cần mua mà Order Service gửi sang
    const itemsRequested = req.body.items;

    if (!itemsRequested || !Array.isArray(itemsRequested)) {
      return res
        .status(400)
        .json({ message: "Dữ liệu Order Service gửi không đúng chuẩn" });
    }

    let allValid = true; // Biến này để chốt xem toàn bộ đơn hàng có hợp lệ không
    const validatedItems = [];

    // 2. Dùng vòng lặp soi từng món một trong danh sách
    for (let i = 0; i < itemsRequested.length; i++) {
      const item = itemsRequested[i];

      // Tìm món hàng đó trong database
      const result = await conn.execute(
        `SELECT id, name, price, stock, category_id, product_image FROM products WHERE id = :id`,
        [item.productId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      // Nếu món hàng tồn tại trong kho
      if (result.rows.length > 0) {
        const product = result.rows[0];

        // Kiểm tra số lượng tồn kho (STOCK) có lớn hơn hoặc bằng số lượng khách mua (quantity) không
        if (product.STOCK < item.quantity) {
          allValid = false; // Kho không đủ hàng
        }

        // Đẩy thông tin món hàng vào danh sách trả về cho Order Service
        validatedItems.push({
          id: product.ID,
          name: product.NAME,
          price: product.PRICE,
          stock: product.STOCK,
          category_id: product.CATEGORY_ID,
          product_image: product.PRODUCT_IMAGE,
        });
      } else {
        // Nếu gõ mã tào lao, không có trong kho
        allValid = false;
      }
    }

    // 3. Đóng gói kết quả gửi về cho Order Service
    return res.json({
      valid: allValid,
      items: validatedItems,
    });
  } catch (error) {
    console.error("Lỗi khi validate sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống kho" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

module.exports = {
  validateProducts,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
