const { request, response } = require('express');
const Producto = require('../models/producto');
const Carrito = require('../models/carrito');
const Compra = require('../models/compra');
const Factura = require('../models/factura');

const mostrarCompras = async (req, res) => {
    const idToken = req.usuario.id;

    try {
        const compras = await Compra.find({ usuario: idToken });

        res.json({
            compras
        });
    } catch (error) {
        res.status(500).json({ msg: 'Hubo un error al obtener las compras' });
    }
};

const comprar = async (req, res) => {
    const idToken = req.usuario.id;

    try {
        const carrito = await Carrito.find({ usuario: idToken }).populate('producto');
        if (carrito.length === 0) {
            return res.status(400).json({ msg: 'No hay productos en el carrito' });
        }

        const productosCompra = carrito.map((item) => item.producto);

        const total = productosCompra.reduce((acc, prod) => acc + prod.precio, 0);

        const productosNoDisponibles = productosCompra.reduce((productos, prod) => {
            const cantidadEnCarrito = carrito.filter((item) => item.producto._id === prod._id).length;
            if (prod.stock < cantidadEnCarrito) {
                const index = productos.findIndex((p) => p._id === prod._id);
                if (index === -1) {
                    productos.push(prod);
                }
            }
            return productos;
        }, []);

        if (productosNoDisponibles.length > 0) {
            return res.status(400).json({
                msg: `No hay suficientes productos en el stock: ${productosNoDisponibles.map(prod => {
                    const cantidadEnCarrito = carrito.filter((item) => item.producto._id === prod._id).length;
                    return `${prod.nombre} (${cantidadEnCarrito} en carrito) - Stock: ${prod.stock}`;
                }).join(', ')}`
            });
        }

        const compra = await Compra.create({
            usuario: idToken,
            producto: productosCompra,
            total: total
        });

        await Carrito.deleteMany({ usuario: idToken });

        for (const producto of productosCompra) {
            await Producto.updateOne(
                { _id: producto._id },
                { $inc: { comprados: 1, stock: -1 } }
            );
        }

        res.json({
            msg: 'Compra realizada con éxito',
            compra
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hubo un error al realizar la compra' });
    }
};

const agregarProductoCarrito = async (req = request, res = response) => {
    const { producto } = req.body;
    const { usuario } = req;

    try {
        const productos = await Producto.find({ _id: { $in: producto } });
        if (productos.length === 0) {
            return res.status(404).json({
                msg: 'No se encontraron los productos'
            });
        }

        const productosCarrito = [];
        producto.forEach(id => {
            const producto = productos.find(p => p._id.toString() === id);
            if (producto) {
                productosCarrito.push({ producto: producto._id, usuario: usuario._id });
            }
        });

        await Carrito.insertMany(productosCarrito);

        const cantidadProductos = {};
        productosCarrito.forEach(producto => {
            cantidadProductos[producto.producto.toString()] = (cantidadProductos[producto.producto.toString()] || 0) + 1;
        });

        const productosConCantidad = productos.map(producto => {
            const cantidad = cantidadProductos[producto._id.toString()] || 0;
            return { ...producto.toObject(), cantidad };
        });

        res.json({
            msg: 'Productos agregados al carrito',
            productosConCantidad
        });

    } catch (error) {
        res.status(500).json({
            msg: 'Hubo un error al agregar los productos al carrito',
            error
        });
    }
};

const ProductosFactura = async (req, res) => {
    const idToken = req.usuario.id;

    try {
        const compras = await Compra.find({ usuario: idToken });
        if (!compras || compras.length === 0) {
            return res.status(400).json({ msg: 'No existen compras para este usuario' });
        }

        let productos = [];
        let total = 0;

        await Promise.all(compras.map(async compra => {
            await Promise.all(compra.producto.map(async producto => {
                const productoModel = await Producto.findById(producto._id);
                if (productoModel) {
                    const precio = productoModel.precio;
                    productos.push({
                        producto: producto._id,
                        precio: precio
                    });
                    total = total + precio;
                }
            }));
        }));

        const factura = new Factura({
            usuario: idToken,
            productos: productos,
            total: total
        });

        await factura.save();

        res.json({
            msg: 'Factura creada con éxito',
            factura
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hubo un error al crear la factura' });
    }
};

const mostrarFacturas = async (req, res) => {
    const { usuario } = req.body;

    try {
        const factura = await Factura.find({ usuario });

        res.json({
            factura
        });
    } catch (error) {
        res.status(500).json({ msg: 'Hubo un error al obtener las facturas' });
    }
};






module.exports = {
    agregarProductoCarrito,
    comprar,
    ProductosFactura,
    mostrarCompras,
    mostrarFacturas
}