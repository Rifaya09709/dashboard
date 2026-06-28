import { Router } from 'express';
import { rateFeedback, getFeedback, getAllFeedback } from '../controllers/feedback.controller';

const router = Router();

router.get('/rate',          rateFeedback);   // Email link click → feedback page
router.get('/',              getAllFeedback);  // All feedback
router.get('/:workOrderId',  getFeedback);    // Single WO feedback

export default router;