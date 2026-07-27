const {Router} = require('express');
const authRouter = Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');


authRouter.post('/register', authController.registerUserController); 

authRouter.post('/login', authController.loginUserController);

authRouter.get('/logout', authController.logoutUserController);

authRouter.get('/get-me', authMiddleware.authUser, authController.getMeController);

authRouter.post("/google", authController.googleLoginController);


module.exports = authRouter;