const router = require("express").Router()

const UserController = require("../controller/userController")
const PhotoController = require("../controller/photoController")
const CommentController = require("../controller/commentController")
const SosmedController = require("../controller/sosmedController")
const { authenticateToken } = require("../middleware/auth")

router.post("/users/register", UserController.registerUser)
router.post("/users/login", UserController.login)
router.put("/users/:id", authenticateToken, UserController.updateUser)
router.delete("/users/:id", authenticateToken, UserController.deleteUser)


router.post("/photos", authenticateToken, PhotoController.createPhoto)
router.get("/photos", authenticateToken, PhotoController.getPhoto)
router.put("/photos/:id", authenticateToken, PhotoController.updatePhoto)
router.delete("/photos/:id", authenticateToken, PhotoController.deletePhoto)

router.post("/comments", authenticateToken, CommentController.createComment)
router.get("/comments", authenticateToken, CommentController.getOwnComments)
router.put("/comments/:id", authenticateToken, CommentController.updateComment)
router.delete("/comments/:id", authenticateToken, CommentController.deleteComment)

router.post("/socialmedias", authenticateToken, SosmedController.addSosmed)
router.get("/socialmedias", authenticateToken, SosmedController.getOwnSosmed)
router.put("/socialmedias/:id", authenticateToken, SosmedController.updateSosmed)
router.delete("/socialmedias/:id", authenticateToken, SosmedController.deleteSosmed)

module.exports = router 