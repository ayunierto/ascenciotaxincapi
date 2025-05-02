export interface SendMailOptions {
  from: { email: string; name: string };
  to: string;
  subject: string;
  clientName?: string;
  html: string;
  text: string;
}
