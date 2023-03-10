const { Schema, model } = require('mongoose');

const carritoSchema = new Schema({
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto'
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

module.exports = model('carrito', carritoSchema);