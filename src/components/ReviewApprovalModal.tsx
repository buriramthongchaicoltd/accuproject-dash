import React, { useState, FormEvent } from 'react';
import { Disbursement } from '../types';
import { 
  X, CheckCircle2, XCircle, FileText, UserCheck, ShieldCheck, 
  ExternalLink, Paperclip, Calendar, Building2, Eye, PenTool
} from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { numberToThaiBaht, getCompanyProfile } from '../utils/thaiBahtText';

interface ReviewApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursement: Disbursement | null;
  onApprove: (id: string, reviewerData: {
    role: 'reviewer' | 'approver';
    name: string;
    signature: string;
    notes: string;
    status: 'approved' | 'rejected' | 'pending';
  }) => void;
}

export function ReviewApprovalModal({
  isOpen,
  onClose,
  disbursement,
  onApprove
}: ReviewApprovalModalProps) {
  const [role, setRole] = useState<'reviewer' | 'approver'>('reviewer');
  const [officerName, setOfficerName] = useState('นายวิศวกร คุมงาน');
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);

  if (!isOpen || !disbursement) return null;

  const totalAmount = disbursement.totalAmount || 0;
  const thaiBahtText = numberToThaiBaht(totalAmount);

  const handleSubmit = (action: 'approved' | 'rejected') => {
    if (!officerName.trim()) {
      alert('กรุณาระบุชื่อผู้ตรวจสอบ/ผู้อนุมัติ');
      return;
    }
    if (!signature && action === 'approved') {
      alert('กรุณาลงนามดิจิทัลเพื่อยืนยันการอนุมัติ');
      return;
    }

    onApprove(disbursement.id, {
      role,
      name: officerName.trim(),
      signature,
      notes: notes.trim(),
      status: action === 'approved' ? 'pending' : 'rejected' // 'pending' ready for finance transfer
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-50 via-white to-purple-50 border-b border-blue-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#005aa9] flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>ตรวจสอบและอนุมัติใบตั้งเบิก</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md font-mono">
                  {disbursement.dbmNo}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                ตรวจสอบรายละเอียดรายการเบิกจ่าย, หลักฐานที่แนบ, ลายเซ็นผู้ขอเบิก ก่อนส่งต่อให้ฝ่ายการเงินโอนเงิน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          
          {/* Summary Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block">บริษัท</span>
                <span className="font-bold text-slate-800">{disbursement.company}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">วันที่เอกสาร</span>
                <span className="font-bold text-slate-800">{disbursement.entryDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">เลขที่อ้างอิง</span>
                <span className="font-mono font-bold text-slate-800">{disbursement.refDocNo || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">ผู้ขอเบิก (Requester)</span>
                <span className="font-bold text-[#005aa9]">{disbursement.recordedBy}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">โครงการก่อสร้าง</span>
                <span className="font-bold text-slate-800">{disbursement.project}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">ผู้รับเงิน / ร้านค้า</span>
                <span className="font-bold text-slate-900">{disbursement.payeeName}</span>
                {disbursement.payeeBankAccount && (
                  <span className="text-[10px] text-slate-500 block font-mono">{disbursement.payeeBankAccount}</span>
                )}
              </div>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 text-xs">
              รายการขอเบิกจ่ายและส่วนลด/ภาษี ({disbursement.items?.length || 0} รายการ)
            </div>
            <div className="divide-y divide-slate-100">
              {disbursement.items?.map((item, idx) => (
                <div key={idx} className="px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">{idx + 1}.</span>
                    <span className="text-slate-800 font-medium">{item.description}</span>
                  </div>
                  <div className={`font-mono font-bold ${item.amount < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-emerald-50/70 px-4 py-2.5 flex items-center justify-between border-t border-emerald-200">
              <span className="font-bold text-emerald-900">ยอดรวมสุทธิ ({thaiBahtText})</span>
              <span className="font-mono font-black text-emerald-900 text-base">
                {totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Attached Proofs & Requester Signature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Requester Signature view */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-600 block">ลายเซ็นผู้ขอเบิก (Requester Signature)</span>
              {disbursement.requesterSignature ? (
                <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center h-20">
                  <img 
                    src={disbursement.requesterSignature} 
                    alt="Requester Signature" 
                    className="max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="bg-white border border-dashed border-slate-300 rounded-lg p-2 flex items-center justify-center h-20 text-slate-400 text-[11px]">
                  (ลงนามแบบลายมือชื่อกระดาษ)
                </div>
              )}
              <div className="text-[10px] text-slate-500 text-center font-medium">
                ลงชื่อ: {disbursement.recordedBy}
              </div>
            </div>

            {/* Attachments List */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-600 block">
                เอกสารแนบประกอบ ({disbursement.attachments?.length || 0} ไฟล์)
              </span>
              {disbursement.attachments && disbursement.attachments.length > 0 ? (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {disbursement.attachments.map((att) => (
                    <div 
                      key={att.id} 
                      className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-slate-200 text-[11px]"
                    >
                      <span className="truncate flex-1 font-medium text-slate-700">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => setPreviewAttachmentUrl(att.url)}
                        className="text-blue-600 hover:underline text-[10px] ml-2 shrink-0 flex items-center gap-0.5"
                      >
                        <Eye className="w-3 h-3" />
                        เปิดดู
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-[11px] text-center py-4">
                  ไม่มีไฟล์แนบในระบบ
                </div>
              )}
            </div>

          </div>

          {/* Action Approval Form */}
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
            <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#005aa9]" />
              <span>ส่วนการลงนามตรวจสอบ / อนุมัติ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ตำแหน่งในการตรวจสอบ</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'reviewer'}
                      onChange={() => {
                        setRole('reviewer');
                        setOfficerName('นายวิศวกร คุมงาน / ธุรการโครงการ');
                      }}
                      className="text-[#005aa9]"
                    />
                    <span className="font-medium text-slate-800">ผู้ตรวจสอบ (Reviewer)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'approver'}
                      onChange={() => {
                        setRole('approver');
                        setOfficerName('ผู้จัดการโครงการ / ผู้อนุมัติจ่าย');
                      }}
                      className="text-[#005aa9]"
                    />
                    <span className="font-medium text-slate-800">ผู้อนุมัติ (Approver)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อ-สกุล ผู้ลงนาม *</label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Live Signature Canvas */}
            <SignaturePad
              signerName={officerName}
              signatureDataUrl={signature}
              onSaveSignature={(dataUrl) => setSignature(dataUrl)}
              title={role === 'reviewer' ? 'ลงนามผู้ตรวจสอบ (Reviewer Live Signature)' : 'ลงนามผู้อนุมัติ (Approver Live Signature)'}
            />

            <div>
              <label className="font-bold text-slate-700 block mb-1">ความเห็นเพิ่มเติม / บันทึกการตรวจสอบ</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น ตรวจสอบบิลถูกต้องตามใบสั่งซื้อ อนุญาตให้ฝ่ายการเงินโอนจ่ายได้"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions (Sticky Bottom) */}
        <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('rejected')}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>ตีกลับ / ไม่อนุมัติ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('approved')}
              className="px-5 py-2.5 bg-[#009540] hover:bg-[#007e36] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>อนุมัติและส่งต่อฝ่ายการเงิน</span>
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox Preview */}
      {previewAttachmentUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewAttachmentUrl(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs">ภาพเอกสารแนบ</span>
              <button onClick={() => setPreviewAttachmentUrl(null)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewAttachmentUrl} alt="Attached Proof" className="max-h-[70vh] object-contain mx-auto rounded-lg" />
          </div>
        </div>
      )}

    </div>
  );
}
