const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(

            `
            SELECT

                cp.id,

                cp.cliente_user_id,

                pc.nombres,

                pc.apellidos,

                cp.monto_preaprobado,

                cp.plazo_meses,

                cp.cuota_estimada,

                cp.estado,

                cp.created_at

            FROM creditos_preaprobados cp

            JOIN perfiles_clientes pc

            ON cp.cliente_user_id = pc.user_id

            ORDER BY cp.created_at DESC
            `
        );

        res.json({

            success:true,

            creditos:result.rows

        });

    } catch(error){

        res.status(500).json({

            success:false,

            error:error.message

        });

    }

});

module.exports = router;