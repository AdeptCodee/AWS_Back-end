const oracledb = require("oracledb");
require("dotenv").config();

// gọi kết nối tới Oracle
async function getConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });
    return connection;
  } catch (error) {
    console.error("Lỗi kết nối Cơ sở dữ liệu:", error);
    throw error; // Báo lỗi nếu không kết nối được
  }
}

// Xuất hàm này ra để các file khác có thể dùng
module.exports = { getConnection };
