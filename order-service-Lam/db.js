const oracledb = require("oracledb");
require("dotenv").config();

async function getConnection() {
  try {
    return await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    });
  } catch (err) {
    console.error("Lỗi kết nối Oracle:", err);
    throw err;
  }
}

module.exports = { getConnection };
