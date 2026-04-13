import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { uploadImage, isCloudinaryConfigured } from '@/lib/cloudinary';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Imagem de capa' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const configured = isCloudinaryConfigured();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem deve ter no maximo 5MB.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {!configured && (
        <div className="mt-1 rounded-md bg-yellow-50 p-3 text-xs text-yellow-700">
          Cloudinary nao configurado. Defina VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET nas variaveis de ambiente.
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={!configured || uploading}
        className="hidden"
      />

      {value ? (
        <div className="mt-2 relative inline-block">
          <img src={value} alt="Capa" className="h-40 w-auto rounded-md border object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            title="Remover"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!configured || uploading}
          className="mt-2 flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6" />
              <span className="text-sm">Clique para selecionar uma imagem</span>
              <span className="text-xs text-gray-400">PNG, JPG, WEBP (maximo 5MB)</span>
            </div>
          )}
        </button>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function CoverImagePlaceholder() {
  return (
    <div className="flex h-32 w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-200">
      <ImageIcon className="h-8 w-8 text-gray-400" />
    </div>
  );
}
