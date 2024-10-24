const bcrypt = require("bcryptjs");
const { Buffer } = require("buffer");

const Order = require("../models/orderModel");
const Course = require("../models/courseModel");
const Invoice = require("../models/invoiceModel");
const User = require("../models/userModel");

const realServiceId = 498614016;

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

const loginUzumBank = async function (req, res) {
  const { login, password } = req.body;

  try {
    const user = await User.findOne({ login: login });

    if (!user) {
      return res.status(401).json({ message: "Invalid login or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid login or password" });
    }

    const credentials = Buffer.from(`${login}:${password}`).toString("base64");

    res
      .status(200)
      .json({ message: "Authentication successful", token: credentials });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

const checkTransaction = async (req, res) => {
  const { serviceId, timestamp, params } = req.body;

  console.log("Received request in checkPerform:", req.body);

  if (!serviceId || serviceId !== realServiceId) {
    return res.status(400).json({
      timestamp: timestamp,
      status: "FAILED",
      errorCode: "10006",
    });
  }

  if (!params || !params.courseId || !params.invoiceNumber) {
    return res.status(400).json({
      serviceId: serviceId,
      timestamp: timestamp,
      status: "FAILED",
      errorCode: "10007",
    });
  }

  try {
    const course = (await Course.findById(params.courseId)) || null;

    res.status(200).json({
      serviceId: serviceId,
      timestamp: timestamp,
      status: "OK",
      data: {
        courseId: {
          value: course._id,
        },
        invoiceNumber: {
          value: params.invoiceNumber,
        },
        amount: {
          value: course.amount,
        },
      },
    });
  } catch (error) {
    console.log("Received error: ", error);
    res.status(500).json({
      status: "FAILED",
      errorCode: "99999",
    });
  }
};

const createTransaction = async (req, res) => {
  const { serviceId, timestamp, transId, params, amount } = req.body;

  if (!serviceId || serviceId !== realServiceId) {
    return res.status(400).json({
      transId: transId,
      status: "FAILED",
      transTime: Date.now(),
      errorCode: "10006",
    });
  }

  if (!amount || !timestamp || !transId || !params || parseInt(amount) < 0) {
    return res.status(400).json({
      transId: transId,
      status: "FAILED",
      transTime: Date.now(),
      errorCode: "10005",
    });
  }

  if (!params.courseId || !params.invoiceNumber) {
    console.error("Необходимые параметры отсутствуют в запросе:", req.body);
    return res.status(400).json({
      serviceId: serviceId,
      transId: transId,
      status: "FAILED",
      transTime: Date.now(),
      errorCode: "10007",
    });
  }

  try {
    let transaction =
      (await Order.findOne({ invoiceNumber: params.invoiceNumber })) || null;
    const course = (await Course.findById(params.courseId)) || null;

    if (transaction?.transactionId) {
      return res.status(404).json({
        serviceId: serviceId,
        transId: transId,
        status: "FAILED",
        transTime: Date.now(),
        errorCode: "10010",
      });
    }

    if (!course) {
      return res.status(404).json({
        serviceId: serviceId,
        timestamp: timestamp,
        status: "FAILED",
        errorCode: "10002",
      });
    }
    if (course.price * 100 !== parseInt(amount)) {
      return res.status(400).json({
        serviceId: serviceId,
        timestamp: timestamp,
        status: "FAILED",
        errorCode: "10011",
      });
    }

    let order;

    if (!transaction) {
      order = await Order.create({
        transactionId: transId,
        invoiceNumber: params.invoiceNumber,
        create_time: timestamp,
        amount: parseInt(amount),
        course_id: course._id,
        status: "ВЫСТАВЛЕНО",
        paymentType: "Uzum",
      });
    } else {
      order = await Order.findByIdAndUpdate(
        { invoiceNumber: params.invoiceNumber },
        {
          transactionId: transId,
          create_time: timestamp,
          amount: parseInt(amount),
          course_id: params.courseId,
          status: "ВЫСТАВЛЕНО",
          paymentType: "Uzum",
        },
        { new: true }
      );
    }

    await Invoice.findOneAndUpdate(
      { invoiceNumber: order.invoiceNumber },
      { status: "ВЫСТАВЛЕНО" }
    );

    res.status(201).json({
      serviceId: serviceId,
      transId: transId,
      status: "CREATED",
      transTime: Date.now(),
      data: {
        courseId: {
          value: course._id,
        },
        invoiceNumber: {
          value: order.invoiceNumber,
        },
      },
      amount: String(amount),
    });
  } catch (error) {
    console.log("Received error: ", error);
    res.status(500).json({
      status: "FAILED",
      errorCode: "99999",
    });
  }
};

const confirmTransaction = async (req, res) => {
  const { serviceId, timestamp, transId } = req.body;

  if (!serviceId || !timestamp || !transId) {
    return res.status(400).json({
      status: "FAILED",
      confirmTime: timestamp,
      errorCode: "10005",
    });
  }
  try {
    let order = (await Order.findOne({ transactionId: transId })) || null;

    if (!order || !order?.transactionId) {
      return res.status(404).json({
        serviceId: serviceId,
        transId: transId,
        status: "FAILED",
        confirmTime: timestamp,
        errorCode: "10014",
      });
    }
    switch (order.status) {
      case "ОТМЕНЕНО":
        return res.status(400).json({
          serviceId: serviceId,
          transId: transId,
          status: "FAILED",
          confirmTime: timestamp,
          errorCode: "10015",
        });
      case "ОПЛАЧЕНО":
        return res.status(400).json({
          serviceId: serviceId,
          transId: transId,
          status: "FAILED",
          confirmTime: timestamp,
          errorCode: "10016",
        });
    }

    order.status = "ОПЛАЧЕНО";
    order.perform_time = Date.now();
    await order.save();

    await Invoice.findOneAndUpdate(
      { invoiceNumber: order.invoiceNumber },
      { status: "ОПЛАЧЕНО" }
    );

    res.status(200).json({
      serviceId: serviceId,
      transId: transId,
      status: "CONFIRMED",
      confirmTime: Date.now(),
      data: {
        courseId: {
          value: order.course_id,
        },
        invoiceNumber: {
          value: order.invoiceNumber,
        },
      },
      amount: String(order.amount),
    });
  } catch (error) {
    console.log("Received error: ", error);
    res.status(500).json({
      status: "FAILED",
      errorCode: "99999",
    });
  }
};

const reverseTransaction = async (req, res) => {
  const { serviceId, transId, timestamp } = req.body;

  if (!serviceId || !transId || !timestamp) {
    return res.status(400).json({
      status: "FAILED",
      reverseTime: Date.now(),
      errorCode: "10005",
    });
  }
  try {
    let order = (await Order.findOne({ transactionId: transId })) || null;

    if (!order || !order?.transactionId) {
      return res.status(404).json({
        serviceId: serviceId,
        transId: transId,
        status: "FAILED",
        confirmTime: timestamp,
        errorCode: "10014",
      });
    }
    switch (order?.status) {
      case "ОТМЕНЕНО":
        return res.status(400).json({
          serviceId: serviceId,
          transId: transId,
          status: "FAILED",
          confirmTime: Date.now(),
          errorCode: "10018",
        });
      case "ОПЛАЧЕНО":
        return res.status(400).json({
          serviceId: serviceId,
          transId: transId,
          status: "FAILED",
          confirmTime: Date.now(),
          errorCode: "10017",
        });
    }

    order.status = "ОТМЕНЕНО";
    order.reverseTime = Date.now();
    order.save();

    await Invoice.findOneAndUpdate(
      { invoiceNumber: order.invoiceNumber },
      { status: "ОТМЕНЕНО" }
    );

    res.status(200).json({
      serviceId: serviceId,
      transId: transId,
      status: "REVERSED",
      reverseTime: Date.now(),
      data: {
        courseId: {
          value: order.course_id,
        },
        invoiceNumber: {
          value: order.invoiceNumber,
        },
      },
      amount: String(order.amount),
    });
  } catch (error) {
    console.log("Received error: ", error);
    res.status(500).json({
      status: "FAILED",
      errorCode: "99999",
    });
  }
};

const checkTransactionStatus = async (req, res) => {
  const { serviceId, timestamp, transId } = req.body;

  if (!serviceId || !transId || !timestamp) {
    return res.status(400).json({
      status: "FAILED",
      errorCode: "10005",
    });
  }

  try {
    const order = (await Order.findOne({ transactionId: transId })) || null;

    if (!order || !order?.transactionId) {
      return res.status(404).json({
        serviceId: serviceId,
        transId: transId,
        status: "FAILED",
        transTime: order.create_time || null,
        confirmTime: order.perform_time || null,
        reverseTime: order.cancel_time || null,
        errorCode: "10014",
      });
    }

    res.status(200).json({
      serviceId: serviceId,
      transId: order.transactionId,
      status: order.status,
      transTime: order.create_time || null,
      confirmTime: order.perform_time || null,
      reverseTime: order.cancel_time || null,
      data: {
        courseId: {
          value: order.course_id,
        },
        invoiceNumber: {
          value: order.invoiceNumber,
        },
      },
      amount: String(order.amount),
    });
  } catch (error) {
    console.log("Received error: ", error);
    res.status(500).json({
      status: "FAILED",
      errorCode: "99999",
    });
  }
};

module.exports = {
  loginUzumBank,
  checkTransaction,
  createTransaction,
  confirmTransaction,
  reverseTransaction,
  checkTransactionStatus,
  getUsers,
};
