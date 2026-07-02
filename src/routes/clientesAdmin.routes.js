const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        pc.*,
        um.email
      FROM perfiles_clientes pc
      JOIN usuarios_mock um
      ON pc.user_id = um.id
      ORDER BY pc.nombres
    `);

    res.json({
      success: true,
      clientes: result.rows
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      error:error.message
    });
  }
});

module.exports = router;