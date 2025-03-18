import { Router } from 'express'
import { Request, Response } from 'express'
import { verifyJWT } from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.middleware";
import { createBook } from '../controller/books.controller'
import { createBulkRooms , test } from '../controller/room.controller';

const router: Router = Router();

router.route("/createBulkRooms").get(createBulkRooms);
router.route("/test").get(test);

export default router