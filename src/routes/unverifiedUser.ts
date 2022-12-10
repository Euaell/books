import { Router } from "express";
import { UnverifiedUserController } from "../Controllers/UnverifiedUserController";
import { authUnverifiedUser } from "../middlewares/autherize";

const router = Router();

router.post("/register", UnverifiedUserController.register)
router.post("/verifiy", authUnverifiedUser, UnverifiedUserController.verify)
router.post("/resend", authUnverifiedUser, UnverifiedUserController.resend)

export default router