import type { EditorConfig } from '@ckeditor/ckeditor5-core';

interface CustomEditorConfig extends EditorConfig {
  template?: {
    default: string;
  };
  table?: {
    contentToolbar?: string[];
  };
  simpleUpload?: {
    uploadUrl: string;
  };
}

export const generateCommunicationTemplate = (community: any) => {
  
  return DEFAULT_TEMPLATE
    .replace(/\[COMUNIDADE_NOME\]/g, community?.name || '')
};

export const DEFAULT_TEMPLATE = `<div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #F9F9F9; font-family: Arial, sans-serif;">
  <!-- Cabeçalho -->
  <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #4A90E2, #2C82C9); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600;">[COMUNIDADE_NOME]</h2>
  </div>
  
  <!-- Conteúdo Principal -->
  <div style="background-color: #FFFFFF; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 30px;">
    <div style="color: #333333; line-height: 1.8; font-size: 16px;">
      [CONTEUDO]
    </div>
  </div>
  
  <!-- Rodapé -->
  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ECECEC;">
    <p style="color: #757575; font-size: 14px; margin: 0 0 10px 0;">
      Esta é uma comunicação oficial de [COMUNIDADE_NOME].<br>
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
  }
}; 