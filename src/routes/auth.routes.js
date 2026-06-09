const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.post("/login", async (req, res) => {

  try {

    const {

      email,
      password,

    } = req.body;

    const result =
        await pool.query(

      `
      SELECT *
      FROM usuarios_mock
      WHERE email = $1
      AND password_hash = $2
      `,

      [email, password]
    );

    if (result.rows.length > 0) {

      return res.json({

        success: true,

        usuario:
            result.rows[0],
      });
    }

    return res.status(401).json({

      success: false,

      message:
          "Credenciales incorrectas",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message,
    });
  }
});

router.put("/reset-password", async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;

    const existe = await pool.query(

      `
      SELECT id
      FROM usuarios_mock
      WHERE email = $1
      `,

      [email]
    );

    if (existe.rows.length === 0) {

      return res.status(404).json({

        success: false,

        message:
          "Correo no encontrado",
      });
    }

    await pool.query(

      `
      UPDATE usuarios_mock
      SET password_hash = $1
      WHERE email = $2
      `,

      [password, email]
    );

    res.json({

      success: true,

      message:
        "Contraseña actualizada correctamente",
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