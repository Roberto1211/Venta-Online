const { Router } = require('express');
const { check } = require('express-validator');
const { login } = require('../controllers/auth');
const { loginClient } = require('../controllers/login-cliente');
const { validarCampos } = require('../middlewares/validar-campos');
const router = Router();

router.post('/login', [
    check('correo', 'El correo no es valido').isEmail(),
    check('password', 'La password es obligatoria').not().isEmpty(),
    validarCampos,
] ,login);

router.post('/loginCliente', [
    check('correo', 'El correo no es valido').isEmail(),
    check('password', 'La password es obligatoria').not().isEmpty(),
    validarCampos,
] ,loginClient);

module.exports = router;