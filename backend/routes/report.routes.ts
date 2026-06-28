import { Router } from 'express';
import { generatePDFReport } from '../controllers/report.controller';

const router = Router();
router.get('/monthly/:month', generatePDFReport);

export default router;