const router = require("express").Router();

const { sendEmailController } = require("../controllers/sendEmailController");

router.post("/send-email", sendEmailController);

module.exports = router;
