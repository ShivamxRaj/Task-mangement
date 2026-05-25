# backend/app/providers/gmail_provider.py
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from backend.config import Config

class GmailProvider:
    def __init__(self):
        self.sender_email = Config.GMAIL_SENDER_EMAIL
        self.app_password = Config.GMAIL_APP_PASSWORD

    def send_email(self, to: str, subject: str, html_body: str) -> bool:
        """
        Send an HTML email via Gmail SMTP.
        Returns True if successful, False otherwise.
        """
        if not self.sender_email or not self.app_password:
            print("[GmailProvider] Gmail credentials not fully configured. Email was not sent.")
            print(f"[GmailProvider] Target: {to}")
            print(f"[GmailProvider] Subject: {subject}")
            return False

        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.sender_email
        msg['To'] = to

        # Attach HTML content
        part = MIMEText(html_body, 'html')
        msg.attach(part)

        try:
            # Connect to Gmail SMTP server
            # Port 465 is for SSL, Port 587 is for TLS
            server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            server.login(self.sender_email, self.app_password)
            server.sendmail(self.sender_email, to, msg.as_string())
            server.quit()
            print(f"[GmailProvider] Email successfully sent to {to}")
            return True
        except Exception as e:
            print(f"[GmailProvider] Failed to send email to {to}: {e}")
            return False
