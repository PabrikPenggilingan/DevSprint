import { Router } from 'express';
import { dashboardRouter } from './dashboard.routes';
import { productRouter } from './product.routes';
import { saleRouter } from './sale.routes';
import { stockRouter } from './stock.routes';

// Everything below is mounted under /api (see app.ts).
export const apiRouter = Router();

apiRouter.use('/products', productRouter);
apiRouter.use('/sales', saleRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/', stockRouter); // /stock-adjustments and /stock-movements
