#!/bin/bash

# Cria os diretórios necessários
mkdir -p public/tinymce
mkdir -p public/tinymce/langs
mkdir -p public/tinymce/skins
mkdir -p public/tinymce/icons
mkdir -p public/tinymce/plugins

# Copia os arquivos do TinyMCE
cp -r node_modules/tinymce/icons/* public/tinymce/icons/
cp -r node_modules/tinymce/plugins/* public/tinymce/plugins/
cp -r node_modules/tinymce/skins/* public/tinymce/skins/
cp -r node_modules/tinymce/themes/* public/tinymce/themes/
cp node_modules/tinymce/tinymce.js public/tinymce/
cp node_modules/tinymce/tinymce.min.js public/tinymce/

echo "Arquivos do TinyMCE copiados com sucesso!" 