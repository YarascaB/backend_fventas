const express = require("express");

const router = express.Router();

const pool = require("../config/db");


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Iniciar sesión
 *     description: Permite autenticar a un usuario mediante su correo electrónico y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jairo@correo.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       401:
 *         description: Credenciales incorrectas.
 *       500:
 *         description: Error interno del servidor.
 */
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


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Registrar usuario
 *     description: Registra un nuevo usuario cliente en el sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Jairo
 *               apellido:
 *                 type: string
 *                 example: Yarasca
 *               email:
 *                 type: string
 *                 example: jairo@correo.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente.
 *       400:
 *         description: El correo ya existe.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/register", async (req, res) => {

  try {

    const {
      nombre,
      apellido,
      email,
      password
    } = req.body;

    const existe = await pool.query(
      `
      SELECT id
      FROM usuarios_mock
      WHERE email = $1
      `,
      [email]
    );

    if (existe.rows.length > 0) {

      return res.status(400).json({
        success: false,
        message: "El correo ya existe"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO usuarios_mock
      (
        email,
        nombre,
        apellido,
        password_hash,
        rol,
        activo
      )
      VALUES
      (
        $1,$2,$3,$4,
        'cliente',
        true
      )
      RETURNING *
      `,
      [
        email,
        nombre,
        apellido,
        password
      ]
    );

    res.json({

      success: true,

      usuario: result.rows[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   put:
 *     tags:
 *       - Autenticación
 *     summary: Restablecer contraseña
 *     description: Actualiza la contraseña de un usuario utilizando su correo electrónico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jairo@correo.com
 *               password:
 *                 type: string
 *                 example: nueva123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *       404:
 *         description: Correo no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
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