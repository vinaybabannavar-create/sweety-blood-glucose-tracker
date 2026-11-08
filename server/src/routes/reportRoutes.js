import { Router } from 'express';
import * as controller from '../controllers/reportController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/daily', asyncHandler(controller.daily));
router.get('/month-to-date', asyncHandler(controller.monthToDate));
router.get('/monthly', asyncHandler(controller.monthly));

export default router;