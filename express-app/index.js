import express, { json } from "express";
import "dotenv/config";
import mysql from "mysql2/promise";
import dbconfig from "./config/dbConfig.js";
import { v4 as uuidv4 } from "uuid";

const port = process.env.PORT || 4000;
const app = express();

console.log(dbconfig);
const connection = await mysql.createConnection({
  host: dbconfig.HOST,
  user: dbconfig.USER,
  password: dbconfig.PASSWORD,
  database: dbconfig.DB_NAME,
  port: dbconfig.DB_PORT,
});
connection.connect();
app.use(json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  let result = await connection.query("SELECT * FROM USERS");
  res.json(result[0]);
});

app.post("/users", async (req, res) => {
  let { name, age } = req.body;
  await connection.query(
    `CREATE TABLE IF NOT EXISTS USERS(
      uid VARCHAR(36) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INT NOT NULL
  );`
  );
  await connection.query(
    `INSERT INTO USERS (uid,name,age) VALUES (UUID(),?,?);`,
    [name, age]
  );
  res.send("add success");
});

app.delete("/users/:uid", async (req, res) => {
  let { uid } = req.params;
  await connection.query(`DELETE FROM USERS WHERE uid = ?;`, [uid]);
  res.send("remove success");
});

app.patch("/users", async (req, res) => {
  let { uid, name, age } = req.body;
  let params = [];
  if (name) {
    params.push(name);
  }
  if (age) {
    params.push(age);
  }
  if (uid) {
    params.push(uid);
  }
  await connection.query(
    `UPDATE USERS
    SET ${name?age?"name = ?,age = ?":"name = ?":""}
    WHERE uid = ?;`,
    params
  );
  res.send("update success");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
