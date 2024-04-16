export const swaggerConfigOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'uRide API Documentation',
        version: '1.0.0',
        description: 'API documentation for the uRide application',
      },
      servers: [
        {
          url: 'http://localhost:3000', // Replace this with your actual server URL
          description: 'Local development server',
        },
      ],
    },
    apis: ['../modules/auth/auth.routes.js', '../modules/user/user.routes.js'], // Define the paths to your API routes
};