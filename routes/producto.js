const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { postProducto, putProducto, deleteProducto, getProductos, getProductosAgotados, productoMasComprado } = require('../controllers/producto');
const { existeProductoPorId } = require('../helpers/db-validators');
const { tieneRole } = require('../middlewares/validar-roles');

const router = Router();

router.get('/', getProductos);

router.get('/disponibilidad', getProductosAgotados);

router.get('/masVendido', productoMasComprado);

router.post('/agregar', [
    validarJWT,
    tieneRole("ADMIN"),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], postProducto);

router.put('/editar/:id', [
    validarJWT,
    tieneRole("ADMIN"),
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('id').custom(existeProductoPorId),
    validarCampos
], putProducto);

router.delete('/eliminar/:id', [
    validarJWT,
    tieneRole("ADMIN"),
    check('id', 'No es un id de Mongo Válido').isMongoId(),
    check('id').custom(existeProductoPorId),
    validarCampos
], deleteProducto);

module.exports = router;