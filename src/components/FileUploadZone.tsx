import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Paperclip, X, FileText, Image as ImageIcon, Eye, Plus } from 'lucide-react';
import { DisbursementAttachment } from '../types';

interface FileUploadZoneProps {
  attachments: DisbursementAttachment[];
  onChange: (attachments: DisbursementAttachment[]) => void;
}

export function FileUploadZone({ attachments, onChange }: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<DisbursementAttachment | null>(null);

  // Handle Clipboard Paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            processFile(file, `ภาพถ่ายหลักฐาน/สลิป_${new Date().toLocaleTimeString('th-TH').replace(/:/g, '-')}`);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [attachments]);

  const processFile = (file: File, customName?: string) => {
    if (attachments.length >= 10) {
      alert('สามารถแนบเอกสารได้สูงสุด 10 ไฟล์');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const newAttachment: DisbursementAttachment = {
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: customName || file.name,
        url: dataUrl,
        type: isPdf ? 'pdf' : file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      onChange([...attachments, newAttachment]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach((file: File) => processFile(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file: File) => processFile(file));
    }
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-[#005aa9]" />
          <span className="font-bold text-slate-800 text-xs">
            แนบเอกสารหลักฐาน / ใบเสนอราคา / ใบแจ้งหนี้ ({attachments.length} ไฟล์)
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">
          รองรับลากไฟล์ หรือกด <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono font-bold">Ctrl+V</kbd> เพื่อวางรูปได้ทันที
        </span>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-[#005aa9] bg-blue-50/70 scale-[1.01]' 
            : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#005aa9] flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-700">
            คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
          </div>
          <div className="text-[10px] text-slate-400">
            รองรับไฟล์ภาพ JPG, PNG, ใบเสนอราคา PDF หรือวางภาพจากคลิปบอร์ดโดยตรง
          </div>
        </div>
      </div>

      {/* Attachment List / Previews */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-xl shadow-xs gap-2 group"
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                {att.type === 'image' ? (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 shrink-0 flex items-center justify-center font-bold text-[10px]">
                    PDF
                  </div>
                )}
                <div className="overflow-hidden min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate" title={att.name}>
                    {att.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {formatFileSize(att.size)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(att)}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  title="ดูตัวอย่าง"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  title="ลบไฟล์"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewAttachment && (
        <div 
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewAttachment(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-3 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="font-bold text-slate-900 text-xs truncate">
                {previewAttachment.name}
              </div>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-2 min-h-[300px]">
              {previewAttachment.type === 'image' ? (
                <img src={previewAttachment.url} alt={previewAttachment.name} className="max-h-[70vh] object-contain rounded-lg shadow-md" />
              ) : (
                <iframe src={previewAttachment.url} title={previewAttachment.name} className="w-full h-[60vh] rounded-lg border border-slate-200" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
