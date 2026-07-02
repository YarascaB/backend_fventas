const express = require("express");
const router = express.Router();
const pool = require("../config/db");


/**
 * @swagger
 * /api/transacciones/{userId}:
 *   get:
 *     tags:
 *       - Transacciones
 *     summary: Consultar movimientos
 *     description: Obtiene los últimos 20 movimientos financieros de un cliente.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 15
 *         description: Identificador del cliente.
 *     responses:
 *       200:
 *         description: Lista de movimientos obtenida correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               movimientos:
 *                 - id: 1
 *                   tipo: credito
 *                   descripcion: Depósito
 *                   monto: 500
 *                   fecha: "2026-07-02T09:00:00Z"
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(

      `
      SELECT
        id,
        tipo,
        descripcion,
        monto,
        fecha
      FROM transacciones
      WHERE user_id = $1
      ORDER BY fecha DESC
      LIMIT 20
      `,
      [userId]
    );

    res.json({

      success: true,

      movimientos: result.rows
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
 * /api/transacciones:
 *   post:
 *     tags:
 *       - Transacciones
 *     summary: Registrar transacción
 *     description: Registra una transacción de crédito o débito y actualiza el saldo de la cuenta.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - tipo
 *               - descripcion
 *               - monto
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 15
 *               tipo:
 *                 type: string
 *                 enum:
 *                   - credito
 *                   - debito
 *                 example: debito
 *               descripcion:
 *                 type: string
 *                 example: Compra POS
 *               monto:
 *                 type: number
 *                 example: 250
 *     responses:
 *       200:
 *         description: Transacción realizada correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               saldo: 13250.50
 *       400:
 *         description: Saldo insuficiente.
 *       404:
 *         description: Cuenta no encontrada.
 *       500:
 *         description: Error interno.
 */
router.post("/", async (req, res) => {

  try {

    const {
      userId,
      tipo,
      descripcion,
      monto
    } = req.body;

    const cuenta = await pool.query(
      `
      SELECT id, saldo
      FROM cuentas
      WHERE user_id = $1
      `,
      [userId]
    );

    if (cuenta.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Cuenta no encontrada"
      });
    }

    const cuentaId =
      cuenta.rows[0].id;

    const saldoActual =
      Number(cuenta.rows[0].saldo);

    let nuevoSaldo = saldoActual;

    if (tipo == "debito") {

      nuevoSaldo =
        saldoActual - Number(monto);

      if (nuevoSaldo < 0) {

        return res.status(400).json({

          success: false,

          message:
            "Saldo insuficiente"
        });
      }
    }

    if (tipo == "credito") {

      nuevoSaldo =
        saldoActual + Number(monto);
    }

    await pool.query(

      `
      UPDATE cuentas
      SET saldo = $1
      WHERE id = $2
      `,
      [
        nuevoSaldo,
        cuentaId
      ]
    );

    await pool.query(

      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      (
        $1,$2,$3,$4,$5
      )
      `,
      [
        userId,
        cuentaId,
        tipo,
        descripcion,
        monto
      ]
    );

    res.json({

      success: true,

      saldo: nuevoSaldo
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
 * /api/transacciones/transferir:
 *   post:
 *     tags:
 *       - Transacciones
 *     summary: Realizar transferencia
 *     description: Transfiere dinero desde la cuenta del cliente hacia otro usuario registrado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderUserId
 *               - receiverEmail
 *               - monto
 *             properties:
 *               senderUserId:
 *                 type: integer
 *                 example: 15
 *               receiverEmail:
 *                 type: string
 *                 example: cliente@correo.com
 *               monto:
 *                 type: number
 *                 example: 800
 *     responses:
 *       200:
 *         description: Transferencia realizada correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Transferencia realizada
 *       400:
 *         description: Saldo insuficiente.
 *       404:
 *         description: Cuenta o destinatario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/transferir", async (req, res) => {

  try {

    const {

      senderUserId,
      receiverEmail,
      monto

    } = req.body;

    // Cuenta origen

    const origen = await pool.query(

      `
      SELECT *
      FROM cuentas
      WHERE user_id = $1
      `,
      [senderUserId]
    );

    if (origen.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Cuenta origen no encontrada"
      });
    }

    // Usuario destino

    const usuarioDestino =
      await pool.query(

      `
      SELECT *
      FROM usuarios_mock
      WHERE email = $1
      `,
      [receiverEmail]
    );

    if (usuarioDestino.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Destinatario no encontrado"
      });
    }

    const receiverUserId =
      usuarioDestino.rows[0].id;

    // Cuenta destino

    const destino = await pool.query(

      `
      SELECT *
      FROM cuentas
      WHERE user_id = $1
      `,
      [receiverUserId]
    );

    if (destino.rows.length === 0) {

      return res.status(404).json({

        success: false,
        message: "Cuenta destino no encontrada"
      });
    }

    const saldoOrigen =
      Number(origen.rows[0].saldo);

    if (saldoOrigen < monto) {

      return res.status(400).json({

        success: false,
        message: "Saldo insuficiente"
      });
    }

    const nuevoSaldoOrigen =
      saldoOrigen - Number(monto);

    const nuevoSaldoDestino =
      Number(destino.rows[0].saldo) +
      Number(monto);

    // Actualizar saldos

    await pool.query(

      `
      UPDATE cuentas
      SET saldo = $1
      WHERE id = $2
      `,
      [
        nuevoSaldoOrigen,
        origen.rows[0].id
      ]
    );

    await pool.query(

      `
      UPDATE cuentas
      SET saldo = $1
      WHERE id = $2
      `,
      [
        nuevoSaldoDestino,
        destino.rows[0].id
      ]
    );

    // Movimiento origen

    await pool.query(

      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      ($1,$2,'debito',$3,$4)
      `,
      [
        senderUserId,
        origen.rows[0].id,
        `Transferencia a ${receiverEmail}`,
        monto
      ]
    );

    // Movimiento destino

    await pool.query(

      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      ($1,$2,'credito',$3,$4)
      `,
      [
        receiverUserId,
        destino.rows[0].id,
        `Transferencia recibida`,
        monto
      ]
    );

    res.json({

      success: true,
      message: "Transferencia realizada"
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
 * /api/transacciones/pago:
 *   post:
 *     tags:
 *       - Transacciones
 *     summary: Pagar un servicio
 *     description: |
 *       Realiza el pago de un servicio (agua, luz, internet, teléfono, etc.)
 *       descontando el monto de la cuenta principal del cliente y registrando
 *       la transacción.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - servicio
 *               - monto
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 15
 *               servicio:
 *                 type: string
 *                 example: Internet
 *               monto:
 *                 type: number
 *                 example: 120.50
 *     responses:
 *       200:
 *         description: Pago realizado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *       400:
 *         description: Saldo insuficiente.
 *       404:
 *         description: Cuenta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/pago", async (req, res) => {

  try {

    const {
      userId,
      monto,
      servicio
    } = req.body;

    const cuenta = await pool.query(
      `
      SELECT *
      FROM cuentas
      WHERE user_id = $1
      `,
      [userId]
    );

    if (cuenta.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada"
      });
    }

    const saldoActual =
      parseFloat(cuenta.rows[0].saldo);

    if (saldoActual < monto) {

      return res.status(400).json({
        success: false,
        message: "Saldo insuficiente"
      });
    }

    const nuevoSaldo =
      saldoActual - monto;

    await pool.query(
      `
      UPDATE cuentas
      SET saldo = $1
      WHERE user_id = $2
      `,
      [nuevoSaldo, userId]
    );

    await pool.query(
      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      (
        $1,
        $2,
        'debito',
        $3,
        $4
      )
      `,
      [
        userId,
        cuenta.rows[0].id,
        `Pago de ${servicio}`,
        monto
      ]
    );

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/**
 * @swagger
 * /api/transacciones/recarga:
 *   post:
 *     tags:
 *       - Transacciones
 *     summary: Recargar celular
 *     description: |
 *       Realiza una recarga telefónica descontando el monto desde la
 *       cuenta principal del cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - numero
 *               - monto
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 15
 *               numero:
 *                 type: string
 *                 example: "987654321"
 *               monto:
 *                 type: number
 *                 example: 20
 *     responses:
 *       200:
 *         description: Recarga realizada correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *       400:
 *         description: Saldo insuficiente.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/recarga", async (req, res) => {

  try {

    const {
      userId,
      numero,
      monto
    } = req.body;

    const cuenta = await pool.query(
      `
      SELECT *
      FROM cuentas
      WHERE user_id = $1
      `,
      [userId]
    );

    const saldo =
      parseFloat(cuenta.rows[0].saldo);

    if (saldo < monto) {

      return res.status(400).json({
        success: false,
        message: "Saldo insuficiente"
      });
    }

    await pool.query(
      `
      UPDATE cuentas
      SET saldo = saldo - $1
      WHERE user_id = $2
      `,
      [monto, userId]
    );

    await pool.query(
      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      (
        $1,
        $2,
        'debito',
        $3,
        $4
      )
      `,
      [
        userId,
        cuenta.rows[0].id,
        `Recarga celular ${numero}`,
        monto
      ]
    );

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/**
 * @swagger
 * /api/transacciones/deposito:
 *   post:
 *     tags:
 *       - Transacciones
 *     summary: Depositar en cuenta de ahorro
 *     description: |
 *       Registra un depósito hacia la cuenta de ahorro del cliente
 *       y genera automáticamente el movimiento correspondiente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - monto
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 15
 *               monto:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Depósito realizado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *       404:
 *         description: Cuenta de ahorro no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/deposito", async (req, res) => {

  try {

    const {
      userId,
      monto
    } = req.body;

    const cuenta = await pool.query(
      `
      SELECT *
      FROM cuentas_ahorro
      WHERE user_id = $1
      `,
      [userId]
    );

    if (cuenta.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada"
      });
    }

    await pool.query(
      `
      UPDATE cuentas_ahorro
      SET saldo = saldo + $1
      WHERE user_id = $2
      `,
      [monto, userId]
    );

    const cuentaPrincipal =
      await pool.query(
        `
        SELECT *
        FROM cuentas
        WHERE user_id = $1
        `,
        [userId]
      );

    await pool.query(
      `
      INSERT INTO transacciones
      (
        user_id,
        cuenta_id,
        tipo,
        descripcion,
        monto
      )
      VALUES
      (
        $1,
        $2,
        'credito',
        'Depósito a ahorro',
        $3
      )
      `,
      [
        userId,
        cuentaPrincipal.rows[0].id,
        monto
      ]
    );

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


module.exports = router;