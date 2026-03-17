import { randomUUID } from "crypto";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../db/products.js";

import { isValidUUID, validateProductBody } from "../utils/validation.js";

export default async function (fastify) {
  // GET all
  fastify.get("/", async (req, reply) => {
    return getProducts();
  });

  // GET by id
  fastify.get("/:id", async (req, reply) => {
    const { id } = req.params;

    if (!isValidUUID(id))
      return reply.status(400).send({ message: "Invalid productId" });

    const product = getProductById(id);

    if (!product)
      return reply.status(404).send({ message: "Product not found" });

    return product;
  });

  // POST create
  fastify.post("/", async (req, reply) => {
    if (!validateProductBody(req.body))
      return reply.status(400).send({ message: "Invalid product data" });

    const newProduct = {
      id: randomUUID(),
      ...req.body,
    };

    createProduct(newProduct);

    reply.status(201).send(newProduct);
  });

  // PUT update
  fastify.put("/:id", async (req, reply) => {
    const { id } = req.params;

    if (!isValidUUID(id))
      return reply.status(400).send({ message: "Invalid productId" });

    const existing = getProductById(id);

    if (!existing)
      return reply.status(404).send({ message: "Product not found" });

    const updated = updateProduct(id, req.body);

    return updated;
  });

  // DELETE
  fastify.delete("/:id", async (req, reply) => {
    const { id } = req.params;

    if (!isValidUUID(id))
      return reply.status(400).send({ message: "Invalid productId" });

    const deleted = deleteProduct(id);

    if (!deleted)
      return reply.status(404).send({ message: "Product not found" });

    reply.status(204).send();
  });
}
