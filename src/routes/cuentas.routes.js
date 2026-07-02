const express = require("express");

const router = express.Router();

const pool = require("../config/db");



/**
 * @swagger
 * /api/cuentas/saldo/{userId}:
 *   get:
 *     tags:
 *       - Cuentas
 *     summary: Consultar saldo de la cuenta principal
 *     description: Devuelve el saldo disponible de la cuenta principal del cliente.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Identificador único del cliente.
 *         schema:
 *           type: integer
 *           example: 15
 *     responses:
 *       200:
 *         description: Saldo obtenido correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               saldo: 18540.50
 *       404:
 *         description: Cuenta no encontrada.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Cuenta no encontrada"
 *       500:
 *         description: Error interno del servidor.
 */
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


/**
 * @swagger
 * /api/cuentas/{userId}:
 *   get:
 *     tags:
 *       - Cuentas
 *     summary: Obtener cuenta de ahorro
 *     description: |
 *       Obtiene la información de la cuenta de ahorro de un cliente,
 *       incluyendo saldo actual, meta de ahorro, tasa de interés
 *       y fecha de apertura.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Identificador único del cliente.
 *         schema:
 *           type: integer
 *           example: 15
 *     responses:
 *       200:
 *         description: Cuenta obtenida correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               cuenta:
 *                 id: 8
 *                 user_id: 15
 *                 saldo: 12500.75
 *                 meta_ahorro: 30000
 *                 tasa_interes: 5.5
 *                 fecha_apertura: "2025-03-10"
 *       404:
 *         description: Cuenta no encontrada.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Cuenta no encontrada"
 *       500:
 *         description: Error interno del servidor.
 */
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

module.exports = router;