import { validate as uuidValidate } from "uuid";

export const isValidUUID = (id) => uuidValidate(id);

export const validateProductBody = (body) => {
  const { name, description, price, category, inStock } = body;

  if (!name || !description || !category) return false;

  if (typeof price !== "number" || price <= 0) return false;

  if (typeof inStock !== "boolean") return false;

  return true;
};
