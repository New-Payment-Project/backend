const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const convert = require("docx-pdf");

router.get("/", (req, res) => {
  const inputPath = path.join(
    __dirname,
    "uploads/privacy_policy/maxfiylik_siyosati.docx"
  );
  const outputPath = path.join(
    __dirname,
    "uploads/privacy_policy/maxfiylik_siyosati.pdf"
  );

  convert(inputPath, outputPath, (err, result) => {
    if (err) {
      console.error("Ошибка конвертации:", err);
      return res.status(500).send("Ошибка при конвертации");
    }

    // Отправляем PDF в браузер
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="maxfiylik_siyosati.pdf"'
    );

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);
  });
});
