import type { EditorConfig } from '@ckeditor/ckeditor5-core';

interface CustomEditorConfig extends EditorConfig {
  template?: {
    default: string;
  };
  table?: {
    contentToolbar?: string[];
  };
}

export const DEFAULT_TEMPLATE = `<div style="max-width: 800px; margin: 0 auto; padding: 20px;">
  <div class="community-logo" style="text-align: center; margin-bottom: 20px;">
    <img src="[LOGO_URL]" alt="Logo da Comunidade" style="max-width: 200px;">
    <h3 style="color: #666; margin-top: 10px;">[COMUNIDADE_NOME]</h3>
  </div>
  
  <h1 style="text-align: center; color: #333;">[TITULO]</h1>
  
  <div style="text-align: center; margin: 20px 0;">
    <img src="[IMAGEM_URL]" alt="Imagem do Evento" style="max-width: 100%; border-radius: 8px;">
  </div>
  
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #444; margin: 0 0 10px 0;">Data e Horário</h3>
    <p style="margin: 5px 0;"><strong>Início:</strong> [DATA_INICIO]</p>
    <p style="margin: 5px 0;"><strong>Término:</strong> [DATA_FIM]</p>
    <p style="margin: 5px 0;"><strong>Local:</strong> [LOCAL]</p>
  </div>
  
  <div style="margin: 20px 0;">
    <h3 style="color: #444; margin: 0 0 10px 0;">Descrição do Evento</h3>
    <p style="line-height: 1.6;">[DESCRICAO]</p>
  </div>
  
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #444; margin: 0 0 10px 0;">Responsável pelo Evento</h3>
    <p style="margin: 5px 0;"><strong>Nome:</strong> [RESPONSAVEL_NOME]</p>
    <p style="margin: 5px 0;"><strong>Contato:</strong> [RESPONSAVEL_EMAIL]</p>
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