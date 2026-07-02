const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const perfil = await pool.query(
      `
      SELECT *
      FROM perfiles_clientes
      WHERE user_id=$1
      `,
      [userId]
    );

    const score = await pool.query(
      `
      SELECT *
      FROM scores_transaccionales
      WHERE user_id=$1
      LIMIT 1
      `,
      [userId]
    );

    const ahorro = await pool.query(
      `
      SELECT saldo
      FROM cuentas_ahorro
      WHERE user_id=$1
      LIMIT 1
      `,
      [userId]
    );

    const credito = await pool.query(
      `
      SELECT *
      FROM creditos_preaprobados
      WHERE cliente_user_id=$1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [userId]
    );

    const solicitudes = await pool.query(
      `
      SELECT COUNT(*) total
      FROM solicitudes_prestamo
      WHERE user_id=$1
      `,
      [userId]
    );

    res.json({

      success:true,

      perfil:perfil.rows[0],

      score:score.rows[0],

      ahorro:ahorro.rows[0],

      credito:credito.rows[0],

      solicitudes:
      solicitudes.rows[0].total

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