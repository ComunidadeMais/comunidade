export type CommunicationType = 'email' | 'sms' | 'whatsapp';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type RecipientType = 'member' | 'group' | 'family' | 'custom';

export interface Communication {
    id: string;
    type: CommunicationType;
    subject: string;
    content: string;
    recipientType: RecipientType;
    recipientId: string;
    status: CommunicationStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CommunicationTemplate {
    id: string;
    name: string;
    type: CommunicationType;
    subject: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CommunicationSettings {
    id?: string;
    emailEnabled: boolean;
    emailSmtpHost: string;
    emailSmtpPort: number;
    emailUsername: string;
    emailPassword: string;
    emailFromName: string;
    emailFromAddress: string;
    smsEnabled: boolean;
    smsProvider: string;
    smsApiKey: string;
    whatsappEnabled: boolean;
    whatsappProvider: string;
    whatsappApiKey: string;
}

export interface CreateCommunicationRequest {
    Type: string;
    Subject: string;
    Content: string;
    RecipientType: string;
    RecipientID: string;
}

export interface CreateTemplateRequest {
    name: string;
    type: CommunicationType;
    subject: string;
    content: string;
} 