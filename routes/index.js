const express = require('express');
const { Product, Order, OrderItem } = require('./models');

require('dotenv').config();

const app = express();

app.use(express.json());

// Product Routes
app.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/products/:id',async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.sendStatus(404);
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/products/:id',  async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.sendStatus(404);
    await product.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// order routes 
app.post('/orders',  async (req, res) => {
    const { items } = req.body;  // items: [{ productId: 1, quantity: 2 }, ...]
  
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.create({ total: 0 }, { transaction });
      let total = 0;
  
      for (let item of items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) throw new Error(`Product ID ${item.productId} not found`);
  
        const amount = product.price * item.quantity;
        total += amount;
  
        await OrderItem.create(
          {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
          },
          { transaction }
        );
      }
  
      await order.update({ total }, { transaction });
      await transaction.commit();
  
      res.json(order);
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({ error: error.message });
    }
  });
  app.put('/orders/:id',  async (req, res) => {
    const { items } = req.body;
  
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.findByPk(req.params.id, { transaction });
      if (!order) return res.sendStatus(404);
  
      // Remove existing OrderItems
      await OrderItem.destroy({ where: { orderId: order.id }, transaction });
  
      let total = 0;
  
      for (let item of items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) throw new Error(`Product ID ${item.productId} not found`);
  
        const amount = product.price * item.quantity;
        total += amount;
  
        await OrderItem.create(
          {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
          },
          { transaction }
        );
      }
  
      await order.update({ total }, { transaction });
      await transaction.commit();
  
      res.json(order);
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({ error: error.message });
    }
  });
  app.get('/orders',  async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: {
          model: OrderItem,
          include: Product,
        },
      });
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
      