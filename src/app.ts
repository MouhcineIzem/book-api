import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from "./routes/auth.routes";
import bookRoutes from "./routes/book.routes";
import reviewRoutes from "./routes/review.routes";
import { swaggerSpec} from "./doc/swagger";


dotenv.config();


const app = express();


app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());



app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});


app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/books/:bookId/reviews', reviewRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Book API Docs',
    swaggerOptions: {
        persistAuthorization: true,
    },
}));


app.use((req, res)=> {
  res.status(404).json({ error: 'Route not found' });
});


app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;