const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/", async (req, res) => {

  try {

    const clientes = await pool.query(
      `SELECT COUNT(*) total FROM perfiles_clientes`
    );

    const solicitudes = await pool.query(
      `
      SELECT COUNT(*) total
      FROM solicitudes_prestamo
      WHERE estado='pendiente'
      `
    );

    const creditos = await pool.query(
      `
      SELECT COUNT(*) total
      FROM creditos_preaprobados
      WHERE estado='desembolsado'
      `
    );

    const monto = await pool.query(
      `
      SELECT
      COALESCE(SUM(monto_preaprobado),0) total
      FROM creditos_preaprobados
      WHERE estado='desembolsado'
      `
    );

    const recientes = await pool.query(
      `
      SELECT

      pc.nombres,

      pc.apellidos,

      sp.monto,

      sp.estado,

      sp.created_at

      FROM solicitudes_prestamo sp

      JOIN perfiles_clientes pc

      ON pc.user_id=sp.user_id

      ORDER BY sp.created_at DESC

      LIMIT 5
      `
    );

    res.json({

      success:true,

      dashboard:{

        clientes:
            clientes.rows[0].total,

        solicitudes:
            solicitudes.rows[0].total,

        creditos:
            creditos.rows[0].total,

        monto:
            monto.rows[0].total,

        recientes:
            recientes.rows
      }
    });

  } catch(error){

    console.log(error);

    res.status(500).json({

      success:false,

      error:error.message
    });
  }

});

module.exports=router;