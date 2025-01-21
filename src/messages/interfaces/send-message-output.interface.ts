export interface SentMessageOutput {
  id: number;
  recipientDetails: string;
  content: string;
  status: string;
  sentAt: Date | null;
  deliveryStatus: string;
  deliveryDetails: any;
  providerRawResponse: any;
  messageId: string | null;
  countryCode: string;
  priority: number;
  messageType: string;
}
