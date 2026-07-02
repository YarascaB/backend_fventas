const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * @swagger
 * /api/buro/{userId}:
 *   get:
 *     tags:
 *       - Buró de Crédito
 *     summary: Obtener score crediticio del cliente
 *     description: |
 *       Devuelve el score transaccional del cliente junto con sus
 *       variables de comportamiento financiero utilizadas para el análisis
 *       de riesgo crediticio.
 *
 *       Este endpoint es clave para la evaluación de solicitudes de préstamo.
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
 *         description: Score obtenido correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               score:
 *                 user_id: 15
 *                 score: 845
 *                 segmento: "A"
 *                 recomendacion: "APROBADO"
 *                 monto_max_sugerido: 30000
 *               features:
 *                 ingresos_promedio: 12000
 *                 gastos_promedio: 6500
 *                 nivel_riesgo: "BAJO"
 *                 frecuencia_transacciones: "ALTA"
 *       404:
 *         description: Score no encontrado para el cliente.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Score no encontrado"
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