import { secretService } from "../secretService";
import nodemailer from 'nodemailer';

interface GmailCredentials {
  email: string;
  appPassword: string;
}

export class GmailAgent {
  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const credentials = await secretService.getKey("gmail");
      if (!credentials) {
        return { 
          success: false, 
          error: "Gmail credentials not configured. Please add your Gmail email and app password in settings." 
        };
      }

      // Parse the Gmail SMTP credentials
      let gmailConfig: GmailCredentials;
      try {
        gmailConfig = JSON.parse(credentials);
      } catch (parseError) {
        return {
          success: false,
          error: "Invalid Gmail credentials format. Please provide valid JSON with email and appPassword fields."
        };
      }

      if (!gmailConfig.email || !gmailConfig.appPassword) {
        return { 
          success: false, 
          error: "Gmail credentials must include both email and appPassword fields."
        };
      }

      // Create SMTP transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailConfig.email,
          pass: gmailConfig.appPassword
        }
      });

      // Send the email
      console.log('Attempting to send email with Gmail SMTP...');
      const result = await transporter.sendMail({
        from: gmailConfig.email,
        to: to,
        subject: subject,
        text: body
      });

      console.log('Email sent successfully:', result.messageId);
      
      return { 
        success: true, 
        result: {
          messageId: result.messageId,
          from: gmailConfig.email,
          to,
          subject,
          body: body.substring(0, 100) + (body.length > 100 ? '...' : '')
        }
      };
    } catch (error) {
      let errorMessage = "Failed to send email";
      
      if (error instanceof Error) {
        if (error.message.includes("Invalid login")) {
          errorMessage = "Invalid Gmail credentials. Please check your email and app password.";
        } else if (error.message.includes("Authentication failed")) {
          errorMessage = "Gmail authentication failed. Ensure 2FA is enabled and you're using an app password.";
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  getAvailableTools(): string[] {
    return [
      "Gmail.sendEmail(to, subject, body) - Send an email via Gmail"
    ];
  }
}

export const gmailAgent = new GmailAgent();
