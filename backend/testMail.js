require("dotenv").config();
const nodemailer = require("nodemailer");
const path = require("path");

// Log environment variables and file paths
console.log("Current directory:", __dirname);
console.log("Looking for .env file in:", path.join(__dirname, ".env"));
console.log("\nEnvironment variables check:");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✓ Set" : "✗ Not set");
console.log("EMAIL_APP_PASSWORD:", process.env.EMAIL_APP_PASSWORD ? "✓ Set" : "✗ Not set");

// Email configuration
const emailConfig = {
  user: "shreyashkhodepatil@gmail.com", // Your Gmail address
  pass: "jvhcgpibjvmsuapt" // Your Gmail App Password
};

// Log configuration
console.log("Email configuration check:");
console.log("User:", emailConfig.user);
console.log("Has Password:", !!emailConfig.pass);

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

// Test email configuration and send a test email
async function testEmail() {
  try {
    // Verify transporter
    await transporter.verify();
    console.log("\n✓ SMTP Server is ready to send emails");

    // Send test email
    const info = await transporter.sendMail({
      from: `"Auto Service Center" <${emailConfig.user}>`,
      to: emailConfig.user, // Send to yourself for testing
      subject: "Test Email from Auto Service Center",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Test Email</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>This is a test email to verify the email configuration is working correctly.</p>
          </div>
          <p style="color: #4b5563; margin-top: 20px;">
            Best regards,<br>
            Your Auto Service Team
          </p>
        </div>
      `
    });

    console.log("✓ Test email sent successfully:", info.messageId);
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    if (error.code === 'EAUTH') {
      console.log("\nAuthentication Error Details:");
      console.log("- Make sure you've replaced the placeholder password with your actual Gmail App Password");
      console.log("- Verify that 2-Step Verification is enabled on your Google Account");
      console.log("- Check that you're using an App Password, not your regular Gmail password");
    }
  }
}

testEmail();
