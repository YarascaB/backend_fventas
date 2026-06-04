const pool = require("./config/db");

async function testDB() {

  try {

    const result =
        await pool.query(
      "SELECT NOW()"
    );

    console.log(
      "PostgreSQL conectado"
    );

    console.log(result.rows);

  } catch (error) {

    console.log(error);
  }
}

testDB();