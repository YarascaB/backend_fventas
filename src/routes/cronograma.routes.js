const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result =
        await pool.query(

      `
      SELECT *
      FROM cronograma_creditos
      WHERE user_id = $1
      ORDER BY numero_cuota
      `,

      [userId]
    );

    res.json(result.rows);

  } catch (error) {

    res.status(500).json({

      error:
          error.message,
    });
  }
});

module.exports = router;