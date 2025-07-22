const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const { toWords } = require("number-to-words");

function generateInvoice(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header with logo (if available)
      if (data.garage.logo) {
        doc.image(data.garage.logo, 40, 40, { width: 60 });
      }
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Carageer The Garage", 110, 45, { align: "left" });
      doc
        .fontSize(14)
        .font("Helvetica")
        .text("Invoice", 0, 80, { align: "right" });
      doc.moveDown(2);

      // Draw line
      doc.moveTo(40, 110).lineTo(555, 110).stroke();

      // Garage details
      doc.fontSize(11).font("Helvetica-Bold").text(data.garage.name, 40, 120);
      doc.fontSize(10).font("Helvetica").text(data.garage.address, 40, 135);
      doc.text(`GSTIN: ${data.garage.gstin}`, 40, 150);
      if (data.garage.phone) doc.text(`Phone: ${data.garage.phone}`, 40, 165);
      if (data.garage.email) doc.text(`Email: ${data.garage.email}`, 40, 180);

      // Invoice & Customer details
      doc.fontSize(10).font("Helvetica-Bold").text("Invoice Details", 350, 120);
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`Invoice No: ${data.invoiceNo}`, 350, 135);
      doc.text(
        `Date: ${new Date(data.invoiceDate).toLocaleDateString()}`,
        350,
        150
      );

      doc
        .font("Helvetica-Bold")
        .text("Bill To:", 350, 170)
        .font("Helvetica")
        .text(`Name: ${data.customer.name}`, 350, 185)
        .text(`Mobile: ${data.customer.mobile}`, 350, 200)
        .text(`GSTIN: ${data.customer.gstin || "N/A"}`, 350, 215);

      // Vehicle details
      doc
        .font("Helvetica-Bold")
        .text("Vehicle Details:", 40, 210)
        .font("Helvetica")
        .text(`Number: ${data.vehicle.number}`, 40, 225)
        .text(`Model: ${data.vehicle.model || "N/A"}`, 40, 240)
        .text(`KM: ${data.vehicle.km || "N/A"}`, 40, 255);

      // Draw another line
      doc.moveTo(40, 270).lineTo(555, 270).stroke();

      // Table headers with background
      const tableTop = 280;
      doc.rect(40, tableTop, 515, 22).fill("#f0f0f0").stroke();
      doc
        .fillColor("#000")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Description", 45, tableTop + 6)
        .text("HSN", 170, tableTop + 6)
        .text("Qty", 220, tableTop + 6)
        .text("Rate", 260, tableTop + 6)
        .text("GST%", 320, tableTop + 6)
        .text("Actual", 370, tableTop + 6)
        .text("GST", 430, tableTop + 6)
        .text("Total", 490, tableTop + 6);

      // Table rows
      let y = tableTop + 28;
      doc.font("Helvetica").fontSize(10);
      data.items.forEach((item, idx) => {
        doc
          .fillColor("#000")
          .text(item.description, 45, y)
          .text(item.hsnCode, 170, y)
          .text(item.quantity.toString(), 220, y)
          .text(`Rs.${item.rate.toFixed(2)}`, 260, y)
          .text(`${item.gstPercent}%`, 320, y)
          .text(`Rs.${item.actualAmount.toFixed(2)}`, 370, y)
          .text(`Rs.${item.gstAmount.toFixed(2)}`, 430, y)
          .text(`Rs.${item.totalAmount.toFixed(2)}`, 490, y);
        y += 20;
        // Draw row line
        doc
          .moveTo(40, y - 2)
          .lineTo(555, y - 2)
          .strokeColor("#e0e0e0")
          .stroke();
      });

      // GST Breakdown
      y += 10;
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#333")
        .text("GST Breakdown:", 45, y);
      y += 15;
      doc.font("Helvetica").fontSize(10);
      data.gstBreakdown.forEach((gst) => {
        doc.text(`GST @ ${gst.percent}%: Rs.${gst.amount.toFixed(2)}`, 45, y);
        y += 15;
      });

      // Totals
      y += 10;
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Subtotal: Rs.${data.totalActualAmount.toFixed(2)}`, 400, y, {
          align: "right",
        });
      y += 15;
      doc
        .font("Helvetica-Bold")
        .text(`Total GST: Rs.${data.totalGST.toFixed(2)}`, 400, y, {
          align: "right",
        });
      y += 15;
      if (data.mechanicCharge > 0) {
        doc
          .font("Helvetica-Bold")
          .text(
            `Mechanic Charge: Rs.${data.mechanicCharge.toFixed(2)}`,
            400,
            y,
            { align: "right" }
          );
        y += 15;
      }
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#1a237e")
        .text(`Grand Total: Rs.${data.grandTotal.toFixed(2)}`, 400, y, {
          align: "right",
        });
      y += 20;

      // Amount in words
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#000")
        .text(
          `Amount in Words: ${toWords(
            Math.round(data.grandTotal)
          )} Rupees Only`,
          45,
          y
        );

      // Footer
      doc
        .fontSize(9)
        .fillColor("#888")
        .text(
          "This is a computer generated invoice. No signature required.",
          40,
          780,
          { align: "center", width: 515 }
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
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header with logo (if available)
      if (bill.garage.logo) {
        doc.image(bill.garage.logo, 40, 40, { width: 60 });
      }
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Carageer The Garage", 110, 45, { align: "left" });
      doc
        .fontSize(14)
        .font("Helvetica")
        .text("Invoice", 0, 80, { align: "right" });
      doc.moveDown(2);

      // Draw line
      doc.moveTo(40, 110).lineTo(555, 110).stroke();

      // Garage details
      doc.fontSize(11).font("Helvetica-Bold").text(bill.garage.name || "", 40, 120);
      
      // Format address components
      const addressComponents = [
        bill.garage.address,
        bill.garage.city,
        bill.garage.state,
        bill.garage.postalCode
      ].filter(Boolean); // Remove undefined/null/empty values
      
      const formattedAddress = addressComponents.join(", ");
      doc.fontSize(10).font("Helvetica").text(formattedAddress || "", 40, 135);
      
      // Only show GSTIN if it exists
      if (bill.garage.gstin) {
        doc.text(`GSTIN: ${bill.garage.gstin}`, 40, 150);
      }
      
      // Only show phone and email if they exist
      if (bill.garage.phone) {
        doc.text(`Phone: ${bill.garage.phone}`, 40, 165);
      }
      if (bill.garage.email) {
        doc.text(`Email: ${bill.garage.email}`, 40, 180);
      }

      // Invoice & Customer details
      doc.fontSize(10).font("Helvetica-Bold").text("Invoice Details", 350, 120);
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`Invoice No: ${bill.invoiceNo}`, 350, 135);
      doc.text(
        `Date: ${new Date(bill.invoiceDate).toLocaleDateString()}`,
        350,
        150
      );

      doc
        .font("Helvetica-Bold")
        .text("Bill To:", 350, 170)
        .font("Helvetica")
        .text(`Name: ${bill.customerDetails.name}`, 350, 185)
        .text(`Mobile: ${bill.customerDetails.mobile}`, 350, 200)
        .text(`Address: ${bill.customerDetails.address}`, 350, 215);

      // Vehicle details
      doc
        .font("Helvetica-Bold")
        .text("Vehicle Details:", 40, 210)
        .font("Helvetica")
        .text(`Number: ${bill.vehicleDetails.number}`, 40, 225)
        .text(`Model: ${bill.vehicleDetails.model}`, 40, 240)
        .text(`Brand: ${bill.vehicleDetails.brand}`, 40, 255);
      let vy = 270;
      if (bill.vehicleDetails.registrationDate) {
        doc.text(
          `Registration Date: ${bill.vehicleDetails.registrationDate}`,
          40,
          vy
        );
        vy += 15;
      }
      if (bill.vehicleDetails.insuranceExpiry) {
        doc.text(
          `Insurance Expiry: ${bill.vehicleDetails.insuranceExpiry}`,
          40,
          vy
        );
        vy += 15;
      }

      // Draw another line
      doc
        .moveTo(40, vy + 10)
        .lineTo(555, vy + 10)
        .stroke();

      // Table headers with background
      const tableTop = vy + 20;
      doc.rect(40, tableTop, 400, 22).fill("#f0f0f0").stroke();
      doc
        .fillColor("#000")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Description", 45, tableTop + 6)
        .text("Qty", 250, tableTop + 6)
        .text("Rate", 300, tableTop + 6)
        .text("Amount", 370, tableTop + 6);

      // Table rows
      let y = tableTop + 28;
      doc.font("Helvetica").fontSize(10);
      let totalAmount = 0;
      bill.items.forEach((item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const amount = quantity * rate;
        totalAmount += amount;

        doc
          .fillColor("#000")
          .text(item.description, 45, y)
          .text(quantity.toString(), 250, y)
          .text(`Rs.${rate.toFixed(2)}`, 300, y)
          .text(`Rs.${amount.toFixed(2)}`, 370, y);
        y += 20;
        doc
          .moveTo(40, y - 2)
          .lineTo(440, y - 2)
          .strokeColor("#e0e0e0")
          .stroke();
      });

      // Totals
      y += 10;
      const mechanicCharge = parseFloat(bill.mechanicCharge) || 0;
      const grandTotal = totalAmount + mechanicCharge;

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Subtotal: Rs.${totalAmount.toFixed(2)}`, 300, y, {
          align: "right",
        });
      y += 15;
      doc
        .font("Helvetica-Bold")
        .text(`Mechanic Charge: Rs.${mechanicCharge.toFixed(2)}`, 300, y, {
          align: "right",
        });
      y += 15;
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#1a237e")
        .text(`Total Amount: Rs.${grandTotal.toFixed(2)}`, 300, y, {
          align: "right",
        });
      y += 20;

      // Additional Notes
      if (bill.additionalNotes) {
        doc.moveDown(2);
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#333")
          .text("Additional Notes:", 45, y);
        y += 15;
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#000")
          .text(bill.additionalNotes, 45, y, { width: 350 });
        y += 30;
      }

      // Footer
      doc
        .fontSize(9)
        .fillColor("#888")
        .text(
          "This is a computer generated invoice. No signature required.",
          40,
          780,
          { align: "center", width: 515 }
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
