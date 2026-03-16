import Fastify from "fastify";
import dotenv from "dotenv";
import productRoutes from "./routes/products.js";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(productRoutes, { prefix: "/api/products" });

const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT,
    });
    console.log(`Server running on port ${process.env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.setNotFoundHandler((req, reply) => {
  reply.status(404).send({
    message: "Route not found",
  });
});

fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  reply.status(500).send({
    message: "Internal Server Error",
  });
});

start();
