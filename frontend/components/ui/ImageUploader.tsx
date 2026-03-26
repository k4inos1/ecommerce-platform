'use client';

import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Solo se aceptan imágenes'); return; }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.url);
    } catch {
      setError('Error al subir imagen. Verifica las credenciales de Cloudinary.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 block">Imagen</label>

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-700">
          <img src={value} alt="Product" className="w-full h-40 object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-lg hover:bg-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-brand transition-colors">
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin w-6 h-6 border-2 border-brand border-t-transparent rounded-full" />
              <span className="text-xs text-gray-400">Subiendo a Cloudinary...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">Arrastra una imagen o haz clic para subir</span>
              <span className="text-xs text-gray-600">PNG, JPG, WEBP (máx 5MB)</span>
            </div>
          )}
        </div>
      )}

      {/* URL manual fallback */}
      <input type="url" placeholder="O pega una URL de imagen..."
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-xs text-white placeholder-gray-600 focus:border-brand focus:outline-none" />

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
