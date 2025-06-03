import { secretService } from "../secretService";
import { google } from "googleapis";

export class GmailAgent {
  async sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const credentials = await secretService.getKey("gmail");
      if (!credentials) {
        return { 
          success: false, 
          error: "Gmail credentials not configured. Please add your Gmail service account credentials in settings." 
        };
      }

      // Parse the service account credentials
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(credentials);
      } catch (parseError) {
        return {
          success: false,
          error: "Invalid Gmail credentials format. Please provide valid service account JSON."
        };
      }

      // Create JWT auth client
      const auth = new google.auth.JWT(
        serviceAccount.client_email,
        undefined,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/gmail.send']
      );

      const gmail = google.gmail({ version: 'v1', auth });

      // Create email message
      const emailContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        '',
        body
      ].join('\n');

      const encodedMessage = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the email
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return { 
        success: true, 
        result: {
          id: response.data.id,
          threadId: response.data.threadId,
          labelIds: response.data.labelIds,
          to,
          subject,
          body: body.substring(0, 100) + (body.length > 100 ? '...' : '')
        }
      };
    } catch (error) {
      let errorMessage = "Failed to send email";
      
      if (error instanceof Error) {
        if (error.message.includes("invalid_grant")) {
          errorMessage = "Invalid Gmail credentials. Please check your service account setup.";
        } else if (error.message.includes("insufficient_scope")) {
          errorMessage = "Gmail API permissions insufficient. Ensure the service account has Gmail send permissions.";
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
