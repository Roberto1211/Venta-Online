const { request, response } = require('express');
const Categoria = require('../models/categoria');
const producto = require('../models/producto');

const getCategorias = async (req = request, res = response) => {

    const query = { estado: true };

    const listaCategorias = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query).populate('usuario', 'nombre')
    ]);

    res.json({
        msg: 'get Api - Controlador Usuario',
        listaCategorias
    });
}

const getCategoriaPorID = async (req = request, res = response) => {

    const { id } = req.params;
    const categoriaById = await Categoria.findById(id).populate('usuario', 'nombre');

    res.status(201).json(categoriaById);
}

const postCategoria = async (req = request, res = response) => {
    const nombre = req.body.nombre.toUpperCase();
    const categoriaDB = await Categoria.findOne({ nombre });

    if (categoriaDB) {
        return res.status(400).json({
            msg: `La categoria ${categoriaDB.nombre}, ya existe`
        });
    }

    const data = {
        nombre,
        usuario: req.usuario._id
    }

    const categoria = new Categoria(data);
    await categoria.save();

    res.status(201).json(categoria);
}


const putCategoria = async (req = request, res = response) => {
    const { id } = req.params;
    const { estado, usuario, ...resto } = req.body;

    resto.nombre = resto.nombre.toUpperCase();
    resto.usuario = req.usuario._id;

    const categoriaEditada = await Categoria.findByIdAndUpdate(id, resto, { new: true });

    res.status(201).json(categoriaEditada);

}

const deleteCategoria = async (req = request, res = response) => {
    const { id } = req.params;

    try {
        const categoria = await Categoria.findById(id);
        const productos = await producto.find({ categoria: id });

        if (productos.length > 0) {
            const categoriaPorDefecto = await Categoria.findOne({ nombre: 'UNCATEGORIZED' });
            if (!categoriaPorDefecto) {
                return res.status(500).json({
                    msg: 'No se encontró la categoría por defecto'
                });
            }
            productos.forEach(async (producto) => {
                producto.categoria = categoriaPorDefecto._id;
                await producto.save();
            });
        }
        
        const categoriaBorrada = await Categoria.findByIdAndUpdate(id, { estado: false }, { new: true });

        res.status(201).json(categoriaBorrada);

    } catch (error) {
        res.status(500).json({
            msg: 'Hubo un error al eliminar la categoría',
            error
        });
    }
};

module.exports = {
    getCategorias,
    getCategoriaPorID,
    postCategoria,
    putCategoria,
    deleteCategoria
}
