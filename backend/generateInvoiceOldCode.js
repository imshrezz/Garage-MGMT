const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const { toWords } = require("number-to-words");

function generateInvoice(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text("Carageer The Garage", { align: "center" });
      doc.moveDown();
      doc.fontSize(15).text("Invoice", { align: "center" });
      doc.moveDown();

      // Garage details
      doc.fontSize(12).text(data.garage.name, { align: "center" });
      doc.fontSize(10).text(data.garage.address, { align: "center" });
      doc.fontSize(10).text(`GSTIN: ${data.garage.gstin}`, { align: "center" });
      if (data.garage.phone) {
        doc
          .fontSize(10)
          .text(`Phone: ${data.garage.phone}`, { align: "center" });
      }
      if (data.garage.email) {
        doc
          .fontSize(10)
          .text(`Email: ${data.garage.email}`, { align: "center" });
      }
      doc.moveDown();

      // Invoice details
      doc.fontSize(10);
      doc.text(`Invoice No: ${data.invoiceNo}`);
      doc.text(`Date: ${new Date(data.invoiceDate).toLocaleDateString()}`);
      doc.moveDown();

      // Customer details
      doc.text("Bill To:");
      doc.text(`Name: ${data.customer.name}`);
      doc.text(`Mobile: ${data.customer.mobile}`);
      doc.text(`GSTIN: ${data.customer.gstin || "N/A"}`);
      doc.moveDown();

      // Vehicle details
      doc.text("Vehicle Details:");
      doc.text(`Number: ${data.vehicle.number}`);
      doc.text(`Model: ${data.vehicle.model || "N/A"}`);
      doc.text(`KM: ${data.vehicle.km || "N/A"}`);
      doc.moveDown();

      // Table headers
      const tableTop = doc.y;
      doc.fontSize(10);

      // Table headers
      doc.text("Description", 50, tableTop);
      doc.text("HSN", 200, tableTop);
      doc.text("Qty", 300, tableTop);
      doc.text("Rate", 350, tableTop);
      doc.text("GST%", 400, tableTop);
      doc.text("Actual", 450, tableTop);
      doc.text("GST", 500, tableTop);
      doc.text("Total", 550, tableTop);

      let y = tableTop + 20;

      // Table rows
      data.items.forEach((item) => {
        doc.text(item.description, 50, y);
        doc.text(item.hsnCode, 200, y);
        doc.text(item.quantity.toString(), 300, y);
        doc.text(`Rs.${item.rate.toFixed(2)}`, 350, y);
        doc.text(`${item.gstPercent}%`, 400, y);
        doc.text(`Rs.${item.actualAmount.toFixed(2)}`, 450, y);
        doc.text(`Rs.${item.gstAmount.toFixed(2)}`, 500, y);
        doc.text(`Rs.${item.totalAmount.toFixed(2)}`, 550, y);
        y += 20;
      });

      // GST Breakdown
      doc.moveDown(2);
      doc.fontSize(10).text("GST Breakdown:", 50);
      data.gstBreakdown.forEach((gst) => {
        doc.text(`GST @ ${gst.percent}%: Rs.${gst.amount.toFixed(2)}`, {
          align: "right",
        });
      });

      // Totals
      doc.moveDown();
      doc.text(`Subtotal: Rs.${data.totalActualAmount.toFixed(2)}`, {
        align: "right",
      });
      doc.text(`Total GST: Rs.${data.totalGST.toFixed(2)}`, { align: "right" });
      if (data.mechanicCharge > 0) {
        doc.text(`Mechanic Charge: Rs.${data.mechanicCharge.toFixed(2)}`, {
          align: "right",
        });
      }
      doc.fontSize(12).text(`Grand Total: Rs.${data.grandTotal.toFixed(2)}`, {
        align: "right",
      });
      doc.text(
        `Amount in Words: ${toWords(Math.round(data.grandTotal))} Rupees Only`,
        { align: "left" }
      );

      // Footer
      doc.fontSize(8);
      doc.text(
        "This is a computer generated invoice. No signature required.",
        50,
        700,
        {
          align: "center",
          width: 500,
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateNonGstInvoice(bill) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text("INVOICE", { align: "center" });
      doc.moveDown();

      // Garage details
      doc.fontSize(12).text(bill.garage.name, { align: "center" });
      doc.fontSize(10).text(bill.garage.address, { align: "center" });
      doc.fontSize(10).text(`GSTIN: ${bill.garage.gstin}`, { align: "center" });
      if (bill.garage.phone) {
        doc
          .fontSize(10)
          .text(`Phone: ${bill.garage.phone}`, { align: "center" });
      }
      if (bill.garage.email) {
        doc
          .fontSize(10)
          .text(`Email: ${bill.garage.email}`, { align: "center" });
      }
      doc.moveDown();

      // Invoice details
      doc.fontSize(10);
      doc.text(`Invoice No: ${bill.invoiceNo}`);
      doc.text(`Date: ${new Date(bill.invoiceDate).toLocaleDateString()}`);
      doc.moveDown();

      // Customer details
      doc.text("Bill To:");
      doc.text(`Name: ${bill.customerDetails.name}`);
      doc.text(`Mobile: ${bill.customerDetails.mobile}`);
      doc.text(`Address: ${bill.customerDetails.address}`);
      doc.moveDown();

      // Vehicle details
      doc.text("Vehicle Details:");
      doc.text(`Number: ${bill.vehicleDetails.number}`);
      doc.text(`Model: ${bill.vehicleDetails.model}`);
      doc.text(`Brand: ${bill.vehicleDetails.brand}`);
      if (bill.vehicleDetails.registrationDate) {
        doc.text(`Registration Date: ${bill.vehicleDetails.registrationDate}`);
      }
      if (bill.vehicleDetails.insuranceExpiry) {
        doc.text(`Insurance Expiry: ${bill.vehicleDetails.insuranceExpiry}`);
      }
      doc.moveDown();

      // Table headers
      const tableTop = doc.y;
      doc.fontSize(10);

      // Table headers
      doc.text("Description", 50, tableTop);
      doc.text("Qty", 300, tableTop);
      doc.text("Rate", 350, tableTop);
      doc.text("Amount", 400, tableTop);

      let y = tableTop + 20;

      // Table rows
      let totalAmount = 0;
      bill.items.forEach((item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const amount = quantity * rate;
        totalAmount += amount;

        doc.text(item.description, 50, y);
        doc.text(quantity.toString(), 300, y);
        doc.text(`Rs.${rate.toFixed(2)}`, 350, y);
        doc.text(`Rs.${amount.toFixed(2)}`, 400, y);
        y += 20;
      });

      // Totals
      doc.moveDown(2);
      const mechanicCharge = parseFloat(bill.mechanicCharge) || 0;
      const grandTotal = totalAmount + mechanicCharge;

      doc.text(`Subtotal: Rs.${totalAmount.toFixed(2)}`, { align: "right" });
      doc.text(`Mechanic Charge: Rs.${mechanicCharge.toFixed(2)}`, {
        align: "right",
      });
      doc
        .fontSize(12)
        .text(`Total Amount: Rs.${grandTotal.toFixed(2)}`, { align: "right" });

      // Additional Notes
      if (bill.additionalNotes) {
        doc.moveDown(2);
        doc.fontSize(10).text("Additional Notes:", 50);
        doc.text(bill.additionalNotes, 50);
      }

      // Footer
      doc.fontSize(8);
      doc.text(
        "This is a computer generated invoice. No signature required.",
        50,
        700,
        {
          align: "center",
          width: 500,
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateInvoice,
  generateNonGstInvoice,
};
