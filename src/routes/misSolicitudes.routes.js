const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * @swagger
 * /api/misSolicitudes/{userId}:
 *   get:
 *     tags:
 *       - Mis Solicitudes
 *     summary: Obtener solicitudes del cliente
 *     description: |
 *       Devuelve el historial de solicitudes de préstamo de un cliente,
 *       ordenadas por fecha de creación (más recientes primero).
 *
 *       Incluye información del monto, plazo, tasa, cuota mensual,
 *       propósito y estado de la solicitud.
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
 *         description: Solicitudes obtenidas correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               solicitudes:
 *                 - id: 1
 *                   monto: 25000
 *                   plazo_meses: 24
 *                   tasa_anual: 18
 *                   cuota_mensual: 1250.50
 *                   proposito: "Capital de trabajo"
 *                   estado: "aprobado"
 *                   created_at: "2026-07-01T10:30:00Z"
 *                 - id: 2
 *                   monto: 10000
 *                   plazo_meses: 12
 *                   tasa_anual: 18
 *                   cuota_mensual: 900.00
 *                   proposito: "Compra de insumos"
 *                   estado: "pendiente"
 *                   created_at: "2026-06-20T14:00:00Z"
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

    const result = await pool.query(
      `
      SELECT
        id,
        monto,
        plazo_meses,
        tasa_anual,
        cuota_mensual,
        proposito,
        estado,
        created_at
      FROM solicitudes_prestamo
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      solicitudes: result.rows
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