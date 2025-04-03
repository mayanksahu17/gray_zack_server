import { Router } from 'express';
import { verifyJWT } from "../middleware/auth.middleware";
import { 
  createRoom, 
  getRooms, 
  getRoomById,
  updateRoom, 
  deleteRoom,
  updateRoomStatus,
  markRoomAsCleaned
} from '../controller/room.controller';

const router: Router = Router();

// Public routes (you might want to protect these with JWT in production)
router.route('/')
  .post(verifyJWT, createRoom)
  .get(getRooms);

router.route('/:id')
  .get(getRoomById)
  .patch(verifyJWT, updateRoom)
  .delete(verifyJWT, deleteRoom);

router.route('/:id/status')
  .patch(verifyJWT, updateRoomStatus);

router.route('/:id/clean')
  .patch(verifyJWT, markRoomAsCleaned);

export default router;