const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/", async (req, res) => {

  try {

    const result = await pool.query(`

      SELECT
        pc.user_id,
        pc.nombres,
        pc.apellidos,
        pc.tipo_negocio,
        pc.zona_negocio,

        st.score,
        st.segmento,
        st.recomendacion,
        st.monto_max_sugerido

      FROM perfiles_clientes pc

      INNER JOIN scores_transaccionales st

      ON pc.user_id = st.user_id

      ORDER BY st.score DESC

    `);

    res.json({

      success: true,

      clientes: result.rows,
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