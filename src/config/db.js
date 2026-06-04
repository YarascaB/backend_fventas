const { Pool } = require("pg");

const pool = new Pool({

  user:
    "postgres.uvzqyqmmvzjtxtyygcfa",

  host:
    "aws-1-us-west-2.pooler.supabase.com",

  database: "postgres",

  password:
    "fuerzaventas",

  port: 5432,

  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;