import { Router } from 'express';
import { unifiedSearch } from '../controller/search.controller';

const router = Router();

router.get('/', unifiedSearch);

export default router; 