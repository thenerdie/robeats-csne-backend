const fastify = require('fastify')();

// Define a test route
fastify.get('/', () => {
  return { hello: 'world' };
});

// Function to start the server
async function startServer() {
  try {
    await fastify.listen(process.env.PORT || 3000, '0.0.0.0');
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer()