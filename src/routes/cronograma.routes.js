const express = require("express");

const router = express.Router();

const pool = require("../config/db");


/**
 * @swagger
 * /api/cronograma/{userId}:
 *   get:
 *     tags:
 *       - Cronograma de Créditos
 *     summary: Obtener cronograma de pagos
 *     description: |
 *       Devuelve el cronograma de pagos de todos los créditos
 *       asociados a un cliente. La información incluye el número
 *       de cuota, fecha de vencimiento, monto, intereses, estado
 *       de pago y saldo pendiente.
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
 *         description: Cronograma obtenido correctamente.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 user_id: 15
 *                 numero_cuota: 1
 *                 fecha_vencimiento: "2026-08-15"
 *                 monto_cuota: 1250.50
 *                 capital: 1000.00
 *                 interes: 250.50
 *                 saldo_pendiente: 24000.00
 *                 estado: "Pendiente"
 *               - id: 2
 *                 user_id: 15
 *                 numero_cuota: 2
 *                 fecha_vencimiento: "2026-09-15"
 *                 monto_cuota: 1250.50
 *                 capital: 1015.00
 *                 interes: 235.50
 *                 saldo_pendiente: 22985.00
 *                 estado: "Pendiente"
 *       404:
 *         description: El cliente no tiene cronograma registrado.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               error: "Error al obtener el cronograma."
 */
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