import { api } from './api';
import {
    Communication,
    CommunicationTemplate,
    CommunicationSettings,
    CreateCommunicationRequest,
    CreateTemplateRequest
} from '../types/communication';

const convertTemplate = (template: any): CommunicationTemplate => ({
    id: template.id,
    name: template.name,
    type: template.type,
    subject: template.subject,
    content: template.content,
    createdAt: template.created_at,
    updatedAt: template.updated_at
});

export const CommunicationService = {
    // Comunicações
    createCommunication: async (communityId: string, data: CreateCommunicationRequest): Promise<Communication> => {
        console.log('Dados sendo enviados para a API:', data); // Log para debug
        const response = await api.post(`/communities/${communityId}/communications`, data);
        return response.data.communication;
    },

    listCommunications: async (communityId: string): Promise<Communication[]> => {
        const response = await api.get(`/communities/${communityId}/communications`);
        return response.data.communications;
    },

    getCommunication: async (communityId: string, communicationId: string): Promise<Communication> => {
        const response = await api.get(`/communities/${communityId}/communications/${communicationId}`);
        return response.data.communication;
    },

    updateCommunication: async (communityId: string, communicationId: string, data: CreateCommunicationRequest): Promise<Communication> => {
        const response = await api.put(`/communities/${communityId}/communications/${communicationId}`, data);
        return response.data.communication;
    },

    deleteCommunication: async (communityId: string, communicationId: string): Promise<void> => {
        await api.delete(`/communities/${communityId}/communications/${communicationId}`);
    },

    sendCommunication: async (communityId: string, communicationId: string): Promise<void> => {
        await api.post(`/communities/${communityId}/communications/${communicationId}/send`);
    },

    // Templates
    createTemplate: async (communityId: string, data: CreateTemplateRequest): Promise<CommunicationTemplate> => {
        const response = await api.post(`/communities/${communityId}/communications/templates`, data);
        return convertTemplate(response.data.template);
    },

    listTemplates: async (communityId: string): Promise<CommunicationTemplate[]> => {
        const response = await api.get(`/communities/${communityId}/communications/templates`);
        return response.data.templates.map(convertTemplate);
    },

    getTemplate: async (communityId: string, templateId: string): Promise<CommunicationTemplate> => {
        const response = await api.get(`/communities/${communityId}/communications/templates/${templateId}`);
        return convertTemplate(response.data.template);
    },

    updateTemplate: async (communityId: string, templateId: string, data: CreateTemplateRequest): Promise<CommunicationTemplate> => {
        const response = await api.put(`/communities/${communityId}/communications/templates/${templateId}`, data);
        return response.data.template;
    },

    deleteTemplate: async (communityId: string, templateId: string): Promise<void> => {
        await api.delete(`/communities/${communityId}/communications/templates/${templateId}`);
    },

    // Configurações
    getSettings: async (communityId: string): Promise<CommunicationSettings> => {
        const response = await api.get(`/communities/${communityId}/communications/settings`);
        return response.data.settings;
    },

    updateSettings: async (communityId: string, data: CommunicationSettings): Promise<CommunicationSettings> => {
        const method = data.id ? 'put' : 'post';
        const response = await api[method](`/communities/${communityId}/communications/settings`, data);
        return response.data.settings;
    },

    testEmail: async (communityId: string): Promise<void> => {
        await api.post(`/communities/${communityId}/communications/test-email`);
    }
}; 