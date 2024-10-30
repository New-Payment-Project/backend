const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const Order = require("../models/orderModel");

const generateContractPDF = async (req, res) => {
  try {
    const { orders } = req.body;
    const order = orders[0];

    if (order.status !== "ОПЛАЧЕНО") {
      return res
        .status(400)
        .send("Договор может быть создан только для оплаченных заказов.");
    }

    const contractDir = path.join(__dirname, "..", "contracts");
    if (!fs.existsSync(contractDir)) {
      fs.mkdirSync(contractDir, { recursive: true });
    }

    const pdfFilePath = path.join(
      contractDir,
      `contract_${order.invoiceNumber}.pdf`
    );
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      fs.writeFileSync(pdfFilePath, pdfBuffer);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=contract_${order.invoiceNumber}.pdf`,
        "Content-Length": pdfBuffer.length,
      });

      res.status(200).send(pdfBuffer);

      const contractUrl = `/contracts/contract_${order.invoiceNumber}.pdf`;

      await Order.updateOne({ _id: order._id }, { $set: { contractUrl } });
    });

    const fontPath = path.join(__dirname, "fonts", "DejaVuSans.ttf");
    doc.font(fontPath);

    doc.fontSize(11);

    doc
      .fontSize(14)
      .text(`ШАРТНОМА № ${order.course_id?.prefix}/${order.invoiceNumber}`, {
        align: "center",
        underline: true,
      });
    doc.fontSize(10).text("(хизмат кўрсатиш ҳақида)", { align: "center" });
    doc.moveDown();

    doc.text(
      `Тошкент шаҳри                                                                                       ${new Date().toLocaleDateString(
        "ru-RU"
      )}`
    );
    doc.moveDown(2);

    doc.text(
      `Ўзбекистон Республикаси Фуқаролик Кодекси талабаларига асосан «Буюртмачи» деб аталувчи ${order.clientName} номидан устав асосида иш юритувчи унинг директори TULABOYEV BEKZOD ZAMON UG‘LI ва «Хизмат кўрсатувчи» деб аталувчи «NORBEKOV SOG’LOMLASHTIRISH VA MASLAHАТ МАРКАЗИ» МЧЖ номидан устав асосида иш юритувчи унинг директори  М.Х.Шарипов  номидан иккинчи томондан қуйидагилар ҳақида ушбу шартномани тузадилар.`
    );
    doc.moveDown();
    doc.fontSize(11).text(`I. ШАРТНОМАНИНГ ПРЕДМЕТИ`, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(
        `1.1. «Хизмат кўрсатувчи» мазкур шартномага асосан «Буюртмачи»нинг буюртмасига асосан жисмоний тарбия-соғломлаштириш фаолияти (саломатлик гуруҳлари) тренерлик хизматларини кўрсатиши, «Буюртмачи» эса кўрсатилган хизматлар тўловини шартномада кўрсатилган муддатларда тўлаш мажбуриятини олади.`
      );
    doc
      .fontSize(10)
      .text(
        `1.2. Соғлаштириш курслари «Буюртмачи» томонидан ташкил этилади, гурухларда етарли тингловчилар йиғилганидан сўнг «Хизмат кўрсатувчи»га хабар берилади.`
      );
    doc.fontSize(10).text(`1.3. Курснинг номи: ${order.course_id?.title}.`);
    doc.moveDown();

    doc
      .fontSize(11)
      .text(`II. ШАРТНОМАНИНГ БАҲОСИ ВА ТЎЛАШ МУДДАТЛАРИ`, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(
        `2.1. «Хизмат кўрсатувчи» томонидан шартноманинг 1.1-бандида кўрсатилган хизматлар кўрсатилганидан сўнг «Буюртмачи» томонидан 10 кун муддатда тўлов амалга оширилади.`
      );
    doc
      .fontSize(10)
      .text(
        `2.2. Тўлов суммаси хизматлар юзасидан тузиладиган ҳисоб-фактураларда қайд этилади ва унга асосан тўловлар амалга оширилади.`
      );
    doc.moveDown();

    doc
      .fontSize(11)
      .text(`III. ТАРАФЛАРНИНГ ҲУҚУҚ ВА МАЖБУРИЯТЛАРИ`, { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`«Буюртмачи»нинг ҳуқуқлари:`);
    doc.fontSize(10).text(`3.1. Соғломлаштириш курслари муддатларини белгилаш`);
    doc
      .fontSize(10)
      .text(`3.2. Хизматларини ҳолати тўғрисидаги маълумотларни олиш.`);
    doc
      .fontSize(10)
      .text(
        `3.3. Жисмоний тарбия-соғломлаштириш фаолияти (саломатлик гуруҳлари) тренерлик хизматларини сифатини назорат қилиш.`
      );
    doc.fontSize(10).text(`«Буюртмачи»нинг мажбуриятлари:`);
    doc.fontSize(10).text(`3.4. Соғломлаштириш курсларини ташкил қилиш,`);
    doc
      .fontSize(10)
      .text(
        `3.5. Шартномада кўрсатилган хизматларини тегишли ҳужжатлар асосида ва белгиланган муддатда қабул қилиш.`
      );
    doc
      .fontSize(10)
      .text(
        `3.6. Хизматлар баҳосини Шартноманинг 2.2-бандида кўрсатилган муддатларда ва шаклда тўлаш.`
      );
    doc
      .fontSize(10)
      .text(
        `3.7. «Буюртмачи» томонидан шартноманинг 2.2-бандида кўрсатилган шартлар ва муддатлар бўйича ҳақ тўлашини талаб қилиш.`
      );
    doc
      .fontSize(10)
      .text(
        `3.8. Шартномада кўрсатилган хизматларни бажарилиши учун шароит яратиб беришни талаб қилиш.`
      );
    doc
      .fontSize(10)
      .text(
        `3.9. Шартномада кўрсатилган хизматларнинг баҳосини ҳақини тегишли муддатларда тўлашни талаб қилиш, ҳисоб-китобларни солиштириш далолатномаларини «Буюртмачи» билан биргаликда тузиш.`
      );
    doc.fontSize(10).text(`«Хизмат кўрсатувчи»нинг мажбуриятлари:`);
    doc
      .fontSize(10)
      .text(
        `3.10. «Буюртмачи»нинг хабарига асосан белгиланган муддатда сифатли хизмат кўрсатиш.`
      );
    doc
      .fontSize(10)
      .text(
        `3.11. «Буюртмачи»нинг буюртмасига асосан амалга оширилган хизматлар тегишли тартибда «Буюртмачи»га топшириш.`
      );
    doc
      .fontSize(10)
      .text(
        `3.12. Хизматларни кўрсатиш жараёнида вужудга келадиган муаммолар ҳақида «Буюртмачи»ни хабардор қилиш.`
      );
    doc
      .fontSize(10)
      .text(
        `3.13. «Буюртмачи»га кўрсатилган хизматлар ҳақида ҳаққоний маълумотларни бериш.`
      );
    doc
      .fontSize(10)
      .text(
        `3.14. Шартномани 1.1-бандида кўрсатилган хизматларнинг сифати ва миқдори буйича кафолат беришни ўз зиммасига олиш.`
      );

    doc.moveDown();
    doc
      .fontSize(11)
      .text(`IV. МАЖБУРИЯТЛАРНИ БАЖАРМАГАНЛИК УЧУН ЖАВОБГАРЛИК.`, {
        align: "center",
      });
    doc.moveDown();

    doc
      .fontSize(10)
      .text(
        `4.1. «Буюртмачи» шартнома баҳосини ўз вақтида тўламаган тақдирда, тўланмаган суммани 0,01 % миқдорида, лекин тўланмаган суммани 10 % дан ошмаган миқдорда ҳар бир ўтказиб юборилган кун учун «Хизмат кўрсатувчи»га пеня тўлайди.`
      );
    doc
      .fontSize(10)
      .text(
        `4.2. Шартномада кўрсатилган хизматлар белгиланган муддатда «Буюртмачи»га топширилмаган тақдирда, «Хизмат кўрсатувчи» ҳар бир ўтказиб юборилган кун учун олдиндан тўлаб қўйилган тўловнинг 0,01% микдорида, лекин тўланмаган суммани 10% дан ошмаган миқдорда «Буюртмачи»га пеня тўлайди.`
      );
    doc
      .fontSize(10)
      .text(
        `4.3. Тарафлар учун ушбу шартномада белгиланмаган жавобгарлик масаласи Ўзбекистон Республикаси Фуқаролик кодекси билан тартибга солинади.`
      );

    doc.moveDown();
    doc.fontSize(11).text(`V.ШАРТНОМАНИ ЎЗГАРТИРИШ ВА БЕКОР ҚИЛИШ АСОСЛАРИ`, {
      align: "center",
    });
    doc.moveDown();

    doc
      .fontSize(10)
      .text(
        `5.1. Ушбу шартнома тарафларнинг келишувига мувофиқ ўзгартирилиши ёки бекор қилиниши мумкин. Шунингдек, шартномани бекор қилиш тарафларнинг бир томонлама хохиши билан амалга оширилиши мумкин, бунда шартномани бекор қилиш юзасидан 1 (бир) ой олдин ёзма таклиф (оферта) бериллиши лозим.`
      );
    doc.fontSize(10)
      .text(`5.2. Шартнома қуйидаги ҳолларда суд тартибида бир томонлама ўзгартирилади ёки бекор қилинади:
    -тарафлар низоларни келишув йули билан хал эта олмаган тақдирда,
    - «Хизмат кўрсатувчи» ва «Буюртмачи» томонидан ҳақиқатга тўғри келмайдиган маълумотлар ва хужжатлар тақдим этилганда,
    - «Хизмат кўрсатувчи» томонидан хизматлар кўрсатилмаганда.
    `);
    doc.fontSize(10).text(`5.3. Суд қарорига асосан.`);

    doc.moveDown();
    doc.fontSize(11).text(`VI. АЛОҲИДА ШАРТЛАР`, { align: "center" });
    doc.moveDown();

    doc
      .fontSize(10)
      .text(
        `6.1. Ушбу шартномага киритиладиган барча ўзгартириш ва тўлдиришлар тарафлар томонидан ёзма тарзда амалга оширилиб, томонларнинг имзоси билан тасдиқлангандан сўнг юридик кучга эга ҳисобланади.`
      );

    doc.moveDown();
    doc
      .fontSize(11)
      .text(`VII. ШАРТНОМАНИНГ КУЧГА КИРИШИ ВА НИЗОЛАРНИ ҲАЛ ҚИЛИШ ТАРТИБИ`, {
        align: "center",
      });
    doc.moveDown();

    doc
      .fontSize(10)
      .text(
        `7.1. Мазкур шартнома имзоланган кундан бошлаб юридик кучга эга бўлади. Шартнома муддати 31-декабрь 2024 йилгача.`
      );
    doc
      .fontSize(10)
      .text(
        `7.2. Мазкур шартнома 2 (икки) нусхада тузилган,  бир хил юридик кучга эга.`
      );
    doc
      .fontSize(10)
      .text(
        `7.3. Ушбу шартнома бўйича келиб чиққан низолар тарафларнинг келишувига мувофиқ ёки  тегишли судларда ҳал қилинади.`
      );

    doc.moveDown();
    doc
      .fontSize(11)
      .text(`VIII. ТОМОНЛАРНИНГ ЮРИДИК МАНЗИЛЛАРИ ВА РЕКВИЗИТЛАРИ`, {
        align: "center",
      });
    doc.moveDown();

    const tableTop = 550;
    const leftColumnX = 50;
    const rightColumnX = 310;
    const tableHeight = 140;

    doc.rect(leftColumnX, tableTop, 220, tableHeight).stroke();
    doc.text(`Заказчик: ${order.clientName}`, leftColumnX + 10, tableTop + 20, {
      width: 200,
    });
    doc.text(`Телефон: ${order.clientPhone}`, leftColumnX + 10, tableTop + 50, {
      width: 200,
    });
    doc.text(`Телеграм: ${order.tgUsername}`, leftColumnX + 10, tableTop + 70, {
      width: 200,
    });

    doc.rect(rightColumnX, tableTop, 220, tableHeight).stroke();
    doc.text("«Хизмат кўрсатувчи»", rightColumnX + 10, tableTop + 10);
    doc.text("«NORBEKOV SOG’LOMLASHTIRISH", rightColumnX + 10, tableTop + 30);
    doc.text("VA MASLAHAT MARKAZI» МЧЖ", rightColumnX + 10, tableTop + 45);
    doc.text("x/p: 2020 8000 0051 1316 7001", rightColumnX + 10, tableTop + 70);
    doc.text("МФО: 00450", rightColumnX + 10, tableTop + 90);
    doc.text("ИНН: 306647621", rightColumnX + 10, tableTop + 110);
    doc.moveDown();
    doc.moveDown();

    doc.text("Директор _______________", leftColumnX, tableTop + 200);
    doc.text("Тулабоев Б.З.", leftColumnX + 140, tableTop + 200);

    doc.text("Директор _______________", rightColumnX, tableTop + 200);
    doc.text("Шарипов  М.Х.", rightColumnX + 140, tableTop + 200);
    doc.end();
  } catch (err) {
    console.error("Ошибка генерации договора:", err);
    res.status(500).send("Ошибка генерации договора");
  }
};

module.exports = { generateContractPDF };
