const express = require("express");

const router = express.Router();

const pool = require("../config/db");


/**
 * @swagger
 * /api/solicitudes:
 *   post:
 *     tags:
 *       - Solicitudes
 *     summary: Crear solicitud de préstamo
 *     description: Registra una nueva solicitud de préstamo para un cliente y calcula la cuota mensual estimada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - monto
 *               - plazo_meses
 *               - tasa_anual
 *               - proposito
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 15
 *               monto:
 *                 type: number
 *                 example: 25000
 *               plazo_meses:
 *                 type: integer
 *                 example: 24
 *               tasa_anual:
 *                 type: number
 *                 example: 18
 *               proposito:
 *                 type: string
 *                 example: Capital de trabajo
 *     responses:
 *       200:
 *         description: Solicitud registrada correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/", async (req, res) => {

  try {

    const {

      user_id,
      monto,
      plazo_meses,
      tasa_anual,
      proposito,

    } = req.body;

    // cálculo simple cuota mensual
    const cuota_mensual =
        (monto / plazo_meses).toFixed(2);

    const result = await pool.query(

      `
      INSERT INTO solicitudes_prestamo (

        user_id,
        monto,
        plazo_meses,
        tasa_anual,
        cuota_mensual,
        estado,
        proposito

      )

      VALUES ($1,$2,$3,$4,$5,$6,$7)

      RETURNING *
      `,

      [

        user_id,
        monto,
        plazo_meses,
        tasa_anual,
        cuota_mensual,
        "pendiente",
        proposito,
      ]
    );

    res.json({

      success: true,

      solicitud: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});


/**
 * @swagger
 * /api/solicitudes:
 *   get:
 *     tags:
 *       - Solicitudes
 *     summary: Listar solicitudes
 *     description: Obtiene todas las solicitudes de préstamo registradas junto con el nombre del cliente.
 *     responses:
 *       200:
 *         description: Lista de solicitudes.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", async (req, res) => {

  try {

    const result = await pool.query(

      `
      SELECT

        sp.id,
        sp.monto,
        sp.estado,
        sp.plazo_meses,
        sp.created_at,

        pc.nombres,
        pc.apellidos

      FROM solicitudes_prestamo sp

      JOIN perfiles_clientes pc
      ON sp.user_id = pc.user_id

      ORDER BY sp.created_at DESC
      `
    );

    res.json({

      success: true,

      solicitudes: result.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/solicitudes/{id}:
 *   put:
 *     tags:
 *       - Solicitudes
 *     summary: Actualizar estado de una solicitud
 *     description: Cambia el estado de una solicitud de préstamo y genera una notificación para el cliente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 example: aprobado
 *     responses:
 *       200:
 *         description: Solicitud actualizada correctamente.
 *       404:
 *         description: Solicitud no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.put("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const { estado } = req.body;

    const result = await pool.query(
  `
      UPDATE solicitudes_prestamo

      SET estado = $1

      WHERE id = $2

      RETURNING *
      `,

      [estado, id]
    );

    const solicitud = result.rows[0];

    console.log("Solicitud actualizada:");
    console.log(solicitud);

    console.log("Insertando notificación...");

    await pool.query(
`
    INSERT INTO notificaciones
    (
        user_id,
        titulo,
        mensaje,
        tipo,
        leida
    )
    VALUES
    (
        $1,
        $2,
        $3,
        $4,
        false
    )
    `,
    [
        solicitud.user_id,
        "Estado de Solicitud",
        `Tu solicitud fue ${estado}`,
        "credito"
    ]);

    res.json({

      success: true,

      solicitud: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/solicitudes/cliente/{userId}:
 *   get:
 *     tags:
 *       - Solicitudes
 *     summary: Listar solicitudes por cliente
 *     description: Devuelve todas las solicitudes registradas por un cliente.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente.
 *     responses:
 *       200:
 *         description: Solicitudes obtenidas correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/cliente/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(

      `
      SELECT *
      FROM solicitudes_prestamo
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({

      success: true,

      solicitudes: result.rows,
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
 * /api/solicitudes/detalle/{id}:
 *   get:
 *     tags:
 *       - Solicitudes
 *     summary: Obtener detalle de una solicitud
 *     description: Obtiene toda la información de una solicitud de préstamo junto con los datos del cliente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud.
 *     responses:
 *       200:
 *         description: Detalle de la solicitud.
 *       404:
 *         description: Solicitud no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/detalle/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
          sp.*,
          pc.nombres,
          pc.apellidos,
          pc.dni,
          pc.telefono,
          pc.ocupacion,
          pc.ingreso_mensual
      FROM solicitudes_prestamo sp
      JOIN perfiles_clientes pc
      ON sp.user_id = pc.user_id
      WHERE sp.id = $1
      `,
      [id]
    );

    if (result.rows.length == 0) {

      return res.status(404).json({
        success:false
      });
    }

    res.json({

      success:true,

      solicitud:result.rows[0]

    });

  } catch(error){

    res.status(500).json({

      success:false,

      error:error.message

    });

  }

});

module.exports = router;