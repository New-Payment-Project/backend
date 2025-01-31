const mongoose = require("mongoose");
const counterModel = require("./counterModel");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: false,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientPhone: {
      type: String,
      required: true,
    },
    clientAddress: {
      type: String,
      required: false,
    },
    tgUsername: {
      type: String,
      required: true,
    },
    passport: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["НЕ ОПЛАЧЕНО", "ВЫСТАВЛЕНО", "ОПЛАЧЕНО", "ОТМЕНЕНО"],
      default: "НЕ ОПЛАЧЕНО",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
