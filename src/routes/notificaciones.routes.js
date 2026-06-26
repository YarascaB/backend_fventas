const express = require("express");

const router = express.Router();

const pool = require("../config/db");

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