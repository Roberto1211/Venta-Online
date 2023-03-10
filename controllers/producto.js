const { request, response, json } = require('express');
const Producto = require('../models/producto');

const getProductos = async (req = request, res = response) => {
    const query = { estado: true };

    const listaProductos = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query).populate('usuario', 'nombre').populate('categoria', 'nombre')
    ]);

    res.json({
        msg: 'Lista de productos activos',
        listaProductos
    });
}

const getProductosAgotados = async (req = request, res = response) => {
    const query = { disponible: false };

    const listaProductos = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query).populate('usuario', 'nombre').populate('categoria', 'nombre')
    ]);

    res.json({
        msg: 'Lista de productos Agotados',
        listaProductos
    });
}

const productoMasComprado = async (req, res) => {
    try {
      const producto = await Producto.findOne({ disponible: true }).sort({ comprados: -1 }).limit(1);
      
      if (!producto) {
        return res.status(404).json({ msg: 'No se encontraron productos' });
      }
  
      res.json({
        msg: 'Producto más comprado',
        producto
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Hubo un error al buscar el producto' });
    }
  };

const postProducto = async (req = request, res = response) => {
    const { estado, usuario, ...body } = req.body;
    const productoDB = await Producto.findOne({ nombre: body.nombre });

    if (productoDB) {
        return res.status(400).json({
            msg: `El producto ${productoDB.nombre}, ya existe en la DB`
        });
    }

    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }

    const producto = await Producto(data);

    await producto.save();

    res.status(201).json(producto);
}


const putProducto = async (req = request, res = response) => {

    const { id } = req.params
    const { estado, usuario, ...resto } = req.body

    if (resto.nombre) {
        resto.nombre = resto.nombre.toUpperCase()
    }

    resto.usuario = req.usuario._id

    const productoActualizado = await Producto.findByIdAndUpdate(id, resto, { new: true })

    res.status(201).json({
        msg: 'Put controller producto',
        productoActualizado
    })
}

const deleteProducto = async (req = request, res = response) => {
    const { id } = req.params

    const productoEliminado = await Producto.findByIdAndUpdate(id, { estado: false }, { new: true })

    res.json({
        msg: 'DELETE',
        productoEliminado
    })
}

module.exports = {
    postProducto,
    putProducto,
    deleteProducto,
    getProductos,
    getProductosAgotados,
    productoMasComprado
}
