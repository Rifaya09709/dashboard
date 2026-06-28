import { Router } from 'express';
import {
  getAllWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder
} from '../controllers/workorder.controller';

const router = Router();

router.get('/', getAllWorkOrders);
router.post('/', createWorkOrder);
router.put('/:id', updateWorkOrder);
router.delete('/:id', deleteWorkOrder);

export default router;