const express = require("express");

const router = express.Router();

const pool = require("../config/db");


/**
 * @swagger
 * /api/clientes/{userId}:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Obtener detalle de un cliente
 *     description: |
 *       Obtiene toda la información de un cliente específico,
 *       incluyendo datos personales, información del negocio,
 *       capacidad financiera y resultado del score transaccional.
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
 *         description: Información del cliente obtenida correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               cliente:
 *                 user_id: 15
 *                 nombres: "Jairo"
 *                 apellidos: "Yarasca Batalla"
 *                 dni: "76543210"
 *                 genero: "Masculino"
 *                 tipo_negocio: "Ferretería"
 *                 zona_negocio: "Huancayo"
 *                 antiguedad_negocio: 8
 *                 ingreso_mensual_est: 12500
 *                 gasto_mensual_est: 6700
 *                 deuda_actual: 15000
 *                 entidades_deuda: 2
 *                 score: 845
 *                 segmento: "A"
 *                 recomendacion: "Aprobado"
 *                 monto_max_sugerido: 30000
 *       404:
 *         description: Cliente no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Cliente no encontrado"
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

    const result = await pool.query(`

      SELECT

        pc.user_id,

        pc.nombres,
        pc.apellidos,
        pc.dni,
        pc.genero,

        pc.tipo_negocio,
        pc.zona_negocio,
        pc.antiguedad_negocio,

        pc.ingreso_mensual_est,
        pc.gasto_mensual_est,
        pc.deuda_actual,
        pc.entidades_deuda,

        st.score,
        st.segmento,
        st.recomendacion,
        st.monto_max_sugerido

      FROM perfiles_clientes pc

      INNER JOIN scores_transaccionales st

      ON pc.user_id = st.user_id

      WHERE pc.user_id = $1

    `, [userId]);

    if (result.rows.length === 0) {

      return res.status(404).json({

        success: false,

        message: "Cliente no encontrado",
      });
    }

    res.json({

      success: true,

      cliente: result.rows[0],
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