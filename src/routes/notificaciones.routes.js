const express = require("express");

const router = express.Router();

const pool = require("../config/db");

/**
 * @swagger
 * /api/notificaciones/{userId}:
 *   get:
 *     tags:
 *       - Notificaciones
 *     summary: Obtener notificaciones del cliente
 *     description: |
 *       Devuelve todas las notificaciones de un usuario,
 *       ordenadas por fecha de creación (más recientes primero).
 *
 *       Las notificaciones pueden incluir:
 *       - Estados de solicitudes de crédito
 *       - Alertas del sistema
 *       - Confirmaciones de transacciones
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Identificador único del usuario.
 *         schema:
 *           type: integer
 *           example: 15
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               notificaciones:
 *                 - id: 1
 *                   user_id: 15
 *                   titulo: "Estado de Solicitud"
 *                   mensaje: "Tu solicitud fue aprobada"
 *                   tipo: "credito"
 *                   leida: false
 *                   created_at: "2026-07-02T10:00:00Z"
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

        const result = await pool.query(

            `
            SELECT *
            FROM notificaciones
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [req.params.userId]
        );

        res.json({

            success: true,

            notificaciones: result.rows
        });

    } catch (error) {

        res.status(500).json({

            success: false,

            error: error.message
        });
    }

});

module.exports = router;