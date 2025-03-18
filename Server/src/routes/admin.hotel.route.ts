import { Router } from 'express'
import { Request, Response } from 'express'
import { verifyJWT } from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.middleware";
import { createBook } from '../controller/books.controller'
import { createHotel} from '../controller/admin.hotel.controller';

const router: Router = Router();

router.route("/create-hotel").post(createHotel);

export default router