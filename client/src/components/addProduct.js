import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../api';

const  AddProduct= ({ product, onSave }) => {
  const [name, setName] = useState(product ? product.name : '');
  const [price, setPrice] = useState(product ? product.price : '');
  const [stock, setStock] = useState(product ? product.stock : '');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setStock(product.stock);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name, price, stock };

    try {
      if (product) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        required
      />
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Stock"
        required
      />
      <button type="submit">{product ? 'Update' : 'Add'} Product</button>
    </form>
  );
};

export default AddProduct;

