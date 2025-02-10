import api from './api';

interface LeadFormData {
  nome: string;
  email: string;
  telefone: string;
  igreja: string;
  funcao: string;
  comoConheceu: string;
  observacao: string;
}

export const sendLeadEmail = async (data: LeadFormData) => {
  try {
    // Prepara os dados para o formato esperado pelo endpoint
    const emailData = {
      name: data.nome,
      email: data.email,
      subject: "Nova Solicitação de Demonstração",
      message: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6B2AEE; border-bottom: 2px solid #6B2AEE; padding-bottom: 10px;">Nova Solicitação de Demonstração</h2>
  
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <tr style="background-color: #f8f9fa;">
      <td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Nome:</strong></td>
      <td style="padding: 12px; border: 1px solid #dee2e6;">${data.nome}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Email:</strong></td>
      <td style="padding: 12px; border: 1px solid #dee2e6;">${data.email}</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
      <td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Telefone:</strong></td>
      <td style="padding: 12px; border: 1px solid #dee2e6;">${data.telefone || 'Não informado'}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Igreja:</strong></td>
      <td style="padding: 12px; border: 1px solid #dee2e6;">${data.igreja}</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
      <td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Função:</strong></td>
      <td style="padding: 12px; border: 1px solid #dee2e6;">${data.funcao}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Como Conheceu:</strong></td>
      <td style="padding: 12px; border: 1px solid #dee2e6;">${data.comoConheceu}</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
      <td style="padding: 12px; border: 1px solid #dee2e6;"><strong>Observações:</strong></td>
      <td style="padding: 12px; border: 1px solid #dee2e6;">${data.observacao || 'Nenhuma observação'}</td>
    </tr>
  </table>
</div>
      `.trim()
    };

    // Envia o email usando o endpoint do backend
    const response = await api.post('/contact', emailData);
    console.log('Email enviado com sucesso:', response);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}; 