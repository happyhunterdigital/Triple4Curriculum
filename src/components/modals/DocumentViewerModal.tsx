import React, { useState } from 'react';
import { 
  X, FileText, Download, Printer, ShieldCheck, 
  Building2, Calendar, User, Tag, Check, Copy, ExternalLink 
} from 'lucide-react';
import { InstitutionalDocument } from '../../types';
import { institutionalDocuments } from '../../lib/documents';

interface DocumentViewerModalProps {
  documentId: string | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ documentId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const doc = institutionalDocuments.find(d => d.id === documentId) || institutionalDocuments[0];

  if (!documentId) return null;

  const handleCopyCitation = () => {
    const citation = `Triple 4 Curriculum. (${doc.lastUpdated.split('-')[0]}). ${doc.title} (${doc.version}). Document ID: ${doc.dhetAccreditationCode || doc.id}. Retrieved from Triple 4C Academic Portal.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([doc.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_${doc.version}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-none shadow-none border border-neutral-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-b border-neutral-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-deep-onyx text-achievement-gold flex items-center justify-center font-mono text-xs rounded-none">
              <FileText className="w-4 h-4 text-achievement-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 bg-academic-green text-white rounded-none">
                  {doc.fileFormat} // {doc.version}
                </span>
                {doc.popiaCompliant && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-deep-onyx bg-achievement-gold/30 px-2 py-0.5 border border-achievement-gold rounded-none">
                    <ShieldCheck className="w-3 h-3 text-academic-green" />
                    POPIA PROTECTED
                  </span>
                )}
              </div>
              <h2 className="text-lg font-serif font-bold text-deep-onyx mt-0.5 leading-snug">
                {doc.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-deep-onyx transition cursor-pointer"
            aria-label="Close document viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-2.5 bg-[#FAF9F5] border-b border-neutral-300 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 text-neutral-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              {doc.departmentName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              UPDATED: {doc.lastUpdated}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              AUTHOR: {doc.author}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCitation}
              className="px-3 py-1.5 border border-neutral-300 hover:border-deep-onyx bg-white text-deep-onyx font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer rounded-none"
              title="Copy official academic citation"
            >
              {copied ? <Check className="w-3 h-3 text-academic-green" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'COPIED' : 'CITE'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-neutral-300 hover:border-deep-onyx bg-white text-deep-onyx font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer rounded-none"
            >
              <Printer className="w-3 h-3" />
              <span>PRINT</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-academic-green hover:bg-academic-green/90 text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer rounded-none border border-academic-green"
            >
              <Download className="w-3 h-3" />
              <span>DOWNLOAD ({doc.fileSizeKb} KB)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Executive Summary Card */}
          <div className="p-4 bg-[#FAF9F5] border border-neutral-300 space-y-2 rounded-none">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-academic-green block">
              [ EXECUTIVE SUMMARY // STATUTORY SCOPE ]
            </span>
            <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans">
              {doc.summary}
            </p>
            {doc.dhetAccreditationCode && (
              <div className="pt-2 text-[10px] font-mono text-neutral-600 border-t border-neutral-200">
                OFFICIAL ACCREDITATION CODE: <strong className="text-academic-green">{doc.dhetAccreditationCode}</strong>
              </div>
            )}
          </div>

          {/* Document Markdown Body */}
          <div className="prose prose-sm max-w-none text-neutral-800 space-y-4">
            {doc.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return (
                  <h1 key={index} className="text-xl sm:text-2xl font-serif font-bold text-deep-onyx border-b pb-2 border-neutral-300">
                    {paragraph.replace('# ', '')}
                  </h1>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-base sm:text-lg font-serif font-bold text-deep-onyx mt-4 mb-2">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1 text-xs sm:text-sm font-sans">
                    {paragraph.split('\n').map((item, i) => (
                      <li key={i}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-xs sm:text-sm leading-relaxed font-sans">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-neutral-300 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              INDEX TAGS:
            </span>
            {doc.tags.map(tag => (
              <span key={tag} className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-none">
                #{tag}
              </span>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#FAF9F5] border-t border-neutral-300 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
          <span>Triple 4C Institutional Repository • SA-SAMS Registered</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-deep-onyx hover:bg-black text-achievement-gold font-mono text-[10px] uppercase tracking-wider rounded-none cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
