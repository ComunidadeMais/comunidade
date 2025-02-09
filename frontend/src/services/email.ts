import emailjs from '@emailjs/browser';

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
    // Inicializa o EmailJS
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

    // Prepara os dados do template
    const templateParams = {
      to_name: "Equipe ComunidadeMais",
      from_name: data.nome,
      from_email: data.email,
      phone: data.telefone || 'Não informado',
      church: data.igreja,
      role: data.funcao,
      how_found: data.comoConheceu,
      notes: data.observacao || 'Nenhuma observação',
      reply_to: data.email
    };

    // Envia o email usando o EmailJS
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email enviado com sucesso:', response);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}; 