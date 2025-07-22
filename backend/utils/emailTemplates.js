const generateReminderEmail = ({ name, vehicleNumber, lastServiceDate }) => {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
      <p>Dear <strong>${name}</strong>,</p>

      <p>We hope you're doing well!</p>

      <p>
        This is a friendly reminder from <strong>Carageer Garage</strong> that it's time for your vehicle's regular servicing.
      </p>

      <table style="margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td><strong>Vehicle Number:</strong></td>
          <td>${vehicleNumber}</td>
        </tr>
        <tr>
          <td><strong>Last Service Date:</strong></td>
          <td>${new Date(lastServiceDate).toLocaleDateString("en-IN")}</td>
        </tr>
      </table>

      <p>We recommend booking your next service appointment soon. Call or reply to this email to schedule it.</p>

      <p style="margin-top: 30px;">
        Thank you for choosing <strong>Zenith Garage</strong>!<br/>
        📞 +91-9876543210<br/>
        📍 CarTown, India
      </p>
    </div>
  `;
};

module.exports = { generateReminderEmail };
