require("dotenv").config();
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds
  timeout: 10000, // 10 seconds
});

function handleDisconnect() {
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setTimeout(handleDisconnect, 2000); // Try to reconnect after 2 seconds
    } else {
      console.log("Connected to the database as id", connection.threadId);
    }
  });

  connection.on('error', (err) => {
    console.error('Database error:', err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconnect if the connection is lost
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = connection;
