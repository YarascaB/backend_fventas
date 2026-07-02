const express = require("express");
const router = express.Router();
const pool = require("../config/db");


/**
 * @swagger
 * /api/ahorros/{userId}:
 *   get:
 *     tags:
 *       - Ahorros
 *     summary: Consultar cuenta de ahorro
 *     description: |
 *       Obtiene la información de la cuenta de ahorro de un cliente
 *       junto con los últimos 10 movimientos registrados.
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
 *         description: Información de la cuenta obtenida correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               cuenta:
 *                 id: 3
 *                 user_id: 15
 *                 saldo: 12500.75
 *                 meta_ahorro: 30000
 *                 tasa_interes: 5.5
 *                 fecha_apertura: "2025-03-10"
 *               movimientos:
 *                 - id: 101
 *                   tipo: "Depósito"
 *                   monto: 500.00
 *                   fecha: "2026-06-28T10:30:00Z"
 *                 - id: 102
 *                   tipo: "Retiro"
 *                   monto: 200.00
 *                   fecha: "2026-06-25T14:15:00Z"
 *       404:
 *         description: Cuenta de ahorro no encontrada.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Cuenta no encontrada"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Error interno del servidor"
 */
router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const cuenta = await pool.query(
      `
      SELECT *
      FROM cuentas_ahorro
      WHERE user_id = $1
      `,
      [userId]
    );

    if (cuenta.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada"
      });
    }

    const movimientos = await pool.query(
      `
      SELECT *
      FROM transacciones
      WHERE user_id = $1
      ORDER BY fecha DESC
      LIMIT 10
      `,
      [userId]
    );

    res.json({

      success: true,

      cuenta: cuenta.rows[0],

      movimientos: movimientos.rows
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