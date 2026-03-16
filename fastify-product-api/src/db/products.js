const products = [];

export const getProducts = () => products;

export const getProductById = (id) => products.find((p) => p.id === id);

export const createProduct = (product) => {
  products.push(product);
  return product;
};

export const updateProduct = (id, updated) => {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = { ...products[index], ...updated };
  return products[index];
};

export const deleteProduct = (id) => {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;

  products.splice(index, 1);
  return true;
};
