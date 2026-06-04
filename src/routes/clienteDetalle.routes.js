const express = require("express");

const router = express.Router();

const pool = require("../config/db");

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