import { Router } from 'express';
import { unifiedSearch } from '../controller/search.controller';

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Perform a unified search across entities like guests, rooms, and bookings
 *     tags: [Search]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: Search term
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results retrieved
 */
router.get('/', unifiedSearch);

export default router;
