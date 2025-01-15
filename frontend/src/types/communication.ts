export type CommunicationType = 'email' | 'sms' | 'whatsapp';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type RecipientType = 'member' | 'group' | 'family' | 'custom';

export interface Communication {
    id: string;
    type: CommunicationType;
    title: string;
    subject: string;
    content: string;
    status: CommunicationStatus;
    recipient_type: RecipientType;
    recipient_id: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
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
    title: string;
    content: string;
    image_url?: string;
}

export interface CreateTemplateRequest {
    name: string;
    type: CommunicationType;
    subject: string;
    content: string;
}

export interface UpdateCommunicationRequest {
    title: string;
    content: string;
    image_url?: string;
}

export interface CommunicationResponse {
    communication: Communication;
}

export interface ListCommunicationsResponse {
    communications: Communication[];
    total: number;
} 