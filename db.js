const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "moin123",
  database: "education_system",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database");
});

async function dbAsync(query, values) {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function hidePass(arrOrObject) {
  if (Array.isArray(arrOrObject)) {
    return arrOrObject.map((item) => {
      if (item.pass) {
        delete item.pass;
      }
      return item;
    });
  } else {
    if (arrOrObject.pass) {
      delete arrOrObject.pass;
    }
    return arrOrObject;
  }
}

module.exports = { connection, dbAsync, hidePass };
