const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.js");
const controller = require("../controller/controller.js");

router.post("/conversations", authenticate, controller.createConversation);
router.post("/conversations/:threadId/messages", authenticate, controller.addMessage);
router.get("/conversations/:threadId", authenticate, controller.getChatHistory);
router.get("/conversations", authenticate, controller.getKeys);
router.delete("/conversations/:threadId", authenticate, controller.deleteChat);

module.exports = router;