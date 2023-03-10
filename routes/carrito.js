const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { agregarProductoCarrito, comprar, mostrarCompras, ProductosFactura, mostrarFacturas } = require('../controllers/carrito');
const { validarJWT } = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');
const router = Router();

router.get('/mostrarCompras', [
    validarJWT,
    tieneRole('CLIENT'),
    validarCampos,
], mostrarCompras);

router.get('/mostrarFacturas', [
    validarJWT,
    tieneRole('ADMIN'),
    validarCampos,
], mostrarFacturas);

router.post('/agregarCarrito', [
    validarJWT,
    tieneRole('CLIENT'),
    validarCampos,
], agregarProductoCarrito);

router.post('/comprar', [
    validarJWT,
    tieneRole('CLIENT'),
    validarCampos,
], comprar);

router.post('/facturar', [
    validarJWT,
    tieneRole('CLIENT'),
    validarCampos,
], ProductosFactura);

module.exports = router;