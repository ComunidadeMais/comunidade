declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: any;
  export default ClassicEditor;
}

declare module '@ckeditor/ckeditor5-upload' {
    export interface FileLoader {
        file: Promise<File>;
        status: string;
        uploaded: number;
        uploadTotal: number;
    }
}

declare module '@ckeditor/ckeditor5-core' {
    export interface Editor {
        getData(): string;
        setData(data: string): void;
        destroy(): Promise<void>;
        plugins: any;
    }

    interface EditorConfig {
        toolbar?: string[] | { items: string[] };
        simpleUpload?: {
            uploadUrl: string;
        };
        language?: string;
        removePlugins?: string[];
    }
} 