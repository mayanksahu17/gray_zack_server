
import {Router} from 'express'
import {verifyJWT} from "../middleware/auth.middleware";
import {upload} from "../middleware/multer.middleware";
import {createBook} from '../controller/books.controller'
const router : Router = Router();





router.route("/addBook").post(upload.fields([{ name: "image", maxCount: 1 }]), createBook);


export default router