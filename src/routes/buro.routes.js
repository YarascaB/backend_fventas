const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const scoreResult = await pool.query(
      `
      SELECT *
      FROM scores_transaccionales
      WHERE user_id = $1
      `,
      [userId]
    );

    const featureResult = await pool.query(
      `
      SELECT *
      FROM features_scoring
      WHERE user_id = $1
      `,
      [userId]
    );

    if (scoreResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Score no encontrado"
      });
    }

    res.json({

      success: true,

      score:
          scoreResult.rows[0],

      features:
          featureResult.rows[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message
    });
  }
});

module.exports = router;