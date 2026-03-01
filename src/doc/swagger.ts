import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Book API',
            version: '1.0.0',
            description:
                'A REST API to manage your personal book library with reviews and ratings.',
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://your-app.railway.app'
                    : 'http://localhost:3000',
                description:
                    process.env.NODE_ENV === 'production'
                        ? 'Production'
                        : 'Development',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Book: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        author: { type: 'string' },
                        year: { type: 'integer' },
                        genre: { type: 'string', nullable: true },
                        description: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        _count: {
                            type: 'object',
                            properties: {
                                reviews: { type: 'integer' },
                            },
                        },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        content: { type: 'string' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        details: { type: 'object' },
                    },
                },
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        hasNextPage: { type: 'boolean' },
                        hasPreviousPage: { type: 'boolean' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        paths: {
            '/auth/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Register a new user',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'email', 'password'],
                                    properties: {
                                        name: { type: 'string', example: 'Alice Martin' },
                                        email: { type: 'string', example: 'alice@example.com' },
                                        password: { type: 'string', example: 'Password1' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: 'User registered successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            token: { type: 'string' },
                                            user: { $ref: '#/components/schemas/User' },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
                        409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    },
                },
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Login',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', example: 'alice@example.com' },
                                        password: { type: 'string', example: 'Password1' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            token: { type: 'string' },
                                            user: { $ref: '#/components/schemas/User' },
                                        },
                                    },
                                },
                            },
                        },
                        401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    },
                },
            },
            '/books': {
                get: {
                    tags: ['Books'],
                    summary: 'Get all books (paginated)',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'genre', in: 'query', schema: { type: 'string' } },
                        { name: 'author', in: 'query', schema: { type: 'string' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['title', 'author', 'year', 'createdAt'], default: 'createdAt' } },
                        { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
                    ],
                    responses: {
                        200: {
                            description: 'List of books',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
                                            meta: { $ref: '#/components/schemas/PaginationMeta' },
                                        },
                                    },
                                },
                            },
                        },
                        401: { description: 'Unauthorized' },
                    },
                },
                post: {
                    tags: ['Books'],
                    summary: 'Create a book',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'author', 'year'],
                                    properties: {
                                        title: { type: 'string', example: 'Clean Code' },
                                        author: { type: 'string', example: 'Robert Martin' },
                                        year: { type: 'integer', example: 2008 },
                                        genre: { type: 'string', example: 'Programming' },
                                        description: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: 'Book created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
                        400: { description: 'Validation error' },
                        401: { description: 'Unauthorized' },
                    },
                },
            },
            '/books/{id}': {
                get: {
                    tags: ['Books'],
                    summary: 'Get a book by ID',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        200: { description: 'Book found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
                        404: { description: 'Book not found' },
                    },
                },
                put: {
                    tags: ['Books'],
                    summary: 'Update a book',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                        author: { type: 'string' },
                                        year: { type: 'integer' },
                                        genre: { type: 'string' },
                                        description: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Book updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
                        404: { description: 'Book not found' },
                    },
                },
                delete: {
                    tags: ['Books'],
                    summary: 'Delete a book',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        204: { description: 'Book deleted' },
                        404: { description: 'Book not found' },
                    },
                },
            },
            '/books/{bookId}/reviews': {
                get: {
                    tags: ['Reviews'],
                    summary: 'Get reviews for a book',
                    parameters: [{ name: 'bookId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        200: {
                            description: 'List of reviews with average rating',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
                                            meta: {
                                                type: 'object',
                                                properties: {
                                                    total: { type: 'integer' },
                                                    averageRating: { type: 'number', nullable: true },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ['Reviews'],
                    summary: 'Add a review to a book',
                    parameters: [{ name: 'bookId', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['content', 'rating'],
                                    properties: {
                                        content: { type: 'string', example: 'An excellent book on writing clean, maintainable code.' },
                                        rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: 'Review created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } } },
                        409: { description: 'Already reviewed this book' },
                    },
                },
            },
            '/books/{bookId}/reviews/{id}': {
                put: {
                    tags: ['Reviews'],
                    summary: 'Update a review',
                    parameters: [
                        { name: 'bookId', in: 'path', required: true, schema: { type: 'string' } },
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        content: { type: 'string' },
                                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Review updated' },
                        404: { description: 'Review not found' },
                    },
                },
                delete: {
                    tags: ['Reviews'],
                    summary: 'Delete a review',
                    parameters: [
                        { name: 'bookId', in: 'path', required: true, schema: { type: 'string' } },
                        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    ],
                    responses: {
                        204: { description: 'Review deleted' },
                        404: { description: 'Review not found' },
                    },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);