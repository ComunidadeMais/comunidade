import type { EditorConfig } from '@ckeditor/ckeditor5-core';

interface CustomEditorConfig extends EditorConfig {
  template?: {
    default: string;
  };
  table?: {
    contentToolbar?: string[];
  };
}

export const DEFAULT_TEMPLATE = `<div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #F9F9F9; font-family: Arial, sans-serif;">
  <!-- Cabeçalho -->
  <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #4A90E2, #2C82C9); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <img src="[LOGO_URL]" alt="Logo da Comunidade" style="max-width: 180px; margin-bottom: 20px;">
    <h2 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600;">[COMUNIDADE_NOME]</h2>
  </div>
  
  <!-- Título do Evento -->
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #333333; font-size: 32px; font-weight: 700; margin: 0;">[TITULO]</h1>
  </div>
  
  <!-- Imagem do Evento -->
  <div style="margin: 30px 0; text-align: center;">
    <img src="[IMAGEM_URL]" alt="Imagem do Evento" style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
  </div>
  
  <!-- Informações do Evento -->
  <div style="background-color: #FFFFFF; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 30px;">
    <h3 style="color: #4A90E2; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Evento</h3>
    
    <div style="display: flex; margin-bottom: 15px; align-items: center;">
      <div style="min-width: 120px;">
        <strong style="color: #333333;">Início:</strong>
      </div>
      <div style="color: #757575;">[DATA_INICIO]</div>
    </div>
    
    <div style="display: flex; margin-bottom: 15px; align-items: center;">
      <div style="min-width: 120px;">
        <strong style="color: #333333;">Término:</strong>
      </div>
      <div style="color: #757575;">[DATA_FIM]</div>
    </div>
    
    <div style="display: flex; margin-bottom: 15px; align-items: center;">
      <div style="min-width: 120px;">
        <strong style="color: #333333;">Local:</strong>
      </div>
      <div style="color: #757575;">[LOCAL]</div>
    </div>
  </div>
  
  <!-- Descrição -->
  <div style="background-color: #FFFFFF; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 30px;">
    <h3 style="color: #4A90E2; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Sobre o Evento</h3>
    <p style="color: #757575; line-height: 1.6; margin: 0;">[DESCRICAO]</p>
  </div>
  
  <!-- Responsável -->
  <div style="background-color: #FFFFFF; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <h3 style="color: #4A90E2; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Responsável pelo Evento</h3>
    
    <div style="display: flex; margin-bottom: 15px; align-items: center;">
      <div style="min-width: 120px;">
        <strong style="color: #333333;">Nome:</strong>
      </div>
      <div style="color: #757575;">[RESPONSAVEL_NOME]</div>
    </div>
    
    <div style="display: flex; align-items: center;">
      <div style="min-width: 120px;">
        <strong style="color: #333333;">Contato:</strong>
      </div>
      <div>
        <a href="mailto:[RESPONSAVEL_EMAIL]" style="color: #2C82C9; text-decoration: none;">[RESPONSAVEL_EMAIL]</a>
      </div>
    </div>
  </div>
  
  <!-- Rodapé -->
  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ECECEC;">
    <p style="color: #757575; font-size: 14px; margin: 0 0 10px 0;">
      Este é um evento oficial de [COMUNIDADE_NOME].<br>
      Para mais informações, entre em contato conosco.
    </p>
    <p style="color: #757575; font-size: 12px; margin: 0;">
      Criado por <a href="https://comunidademais.com.br" target="_blank" style="color: #4A90E2; text-decoration: none; font-weight: 600;">Comunidade+</a>
    </p>
  </div>
</div>`;

export const CKEDITOR_CONFIG: CustomEditorConfig = {
  toolbar: ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', '|', 'link', 'bulletedList', 'numberedList', '|', 'insertTable'],
  language: 'pt-br',
  removePlugins: ['Title', 'CKFinderUploadAdapter', 'CKFinder', 'EasyImage', 'Image', 'ImageCaption', 'ImageStyle', 'ImageToolbar', 'ImageUpload', 'MediaEmbed'],
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
  },
  template: {
    default: DEFAULT_TEMPLATE
  }
}; 