import { Router } from 'express';
import { getAllStats, getStatsByMonth } from '../controllers/stats.controller';

const router = Router();

router.get('/', getAllStats);
router.get('/:month', getStatsByMonth);

export default router;