const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(

      `
      SELECT
        id,
        user_id,
        saldo,
        meta_ahorro,
        tasa_interes,
        fecha_apertura
      FROM cuentas_ahorro
      WHERE user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        success: false,

        message: "Cuenta no encontrada",
      });
    }

    res.json({

      success: true,

      cuenta: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

// SALDO CUENTA PRINCIPAL

router.get("/saldo/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT saldo
      FROM cuentas
      WHERE user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({

        success: false,

        message: "Cuenta no encontrada",
      });
    }

    res.json({

      success: true,

      saldo: result.rows[0].saldo,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

module.exports = router;
module.exports = router;