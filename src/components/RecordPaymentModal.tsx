import { useState, useEffect, useRef, FormEvent, DragEvent } from 'react';
import { Disbursement } from '../types';
import { 
  X, CheckCircle2, ArrowRight, Link, Building2, 
  CreditCard, Banknote, FileCheck, Upload, Image,
  Eye, Trash2, Clipboard, QrCode, AlertCircle, ShieldCheck,
  UserCheck, PenTool, Check, Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import { SignaturePad } from './SignaturePad';
import { generatePVNumber, generateAuditCertificateId } from '../utils/paymentUtils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursement: Disbursement | null;
  disbursements: Disbursement[];
  onConfirmPayment: (
    id: string,
    paymentData: {
      payerAccount: string;
      chequeNo: string;
      paymentDate: string;
      transferAmount: number;
      fee: number;
      paymentMethod: string;
      documentLink: string;
      paymentSlipUrl?: string;
      paymentSlipName?: string;
      financeRecordedBy: string;
      financeSignature?: string;
      pvNo: string;
      paidAt: string;
      auditCertificateId: string;
      status: 'paid';
    }
  ) => void;
  accountsList: string[];
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  disbursement,
  disbursements,
  onConfirmPayment,
  accountsList
}: RecordPaymentModalProps) {
  // Step 2 & 3 state
  const [payerAccount, setPayerAccount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'โอนเงินผ่านธนาคาร' | 'เช็คสั่งจ่าย' | 'เงินสด/เงินสดย่อย'>('โอนเงินผ่านธนาคาร');
  const [chequeNo, setChequeNo] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [fee, setFee] = useState<string>('0');
  const [documentLink, setDocumentLink] = useState('');
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>('');
  const [paymentSlipName, setPaymentSlipName] = useState<string>('');
  const [financeRecordedBy, setFinanceRecordedBy] = useState('น.ส.กมลทิพย์ กรมทอง (ฝ่ายการเงิน)');
  const [payerSignature, setPayerSignature] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [previewSlip, setPreviewSlip] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showQuickSignature, setShowQuickSignature] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize values when disbursement opens
  useEffect(() => {
    if (disbursement && isOpen) {
      setPayerAccount(disbursement.payerAccount || accountsList[0] || 'BBL #297-3-033893 (BTC กระแสรายวัน)');
      
      // Determine payment method default
      if (disbursement.paymentMethod?.includes('เช็ค')) {
        setPaymentMethod('เช็คสั่งจ่าย');
      } else if (disbursement.paymentMethod?.includes('เงินสด')) {
        setPaymentMethod('เงินสด/เงินสดย่อย');
      } else {
        setPaymentMethod('โอนเงินผ่านธนาคาร');
      }

      setChequeNo(disbursement.chequeNo || '');
      
      const today = new Date();
      const thaiYear = today.getFullYear() + 543;
      const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${thaiYear}`;
      setPaymentDate(disbursement.paymentDate && disbursement.paymentDate !== '-' ? disbursement.paymentDate : formattedToday);

      const netAmount = disbursement.transferAmount && disbursement.transferAmount > 0 
        ? disbursement.transferAmount 
        : disbursement.totalAmount;
      setTransferAmount(netAmount.toString());
      setFee(disbursement.fee ? disbursement.fee.toString() : '0');
      setDocumentLink(disbursement.documentLink || '');
      setPaymentSlipUrl(disbursement.paymentSlipUrl || '');
      setPaymentSlipName(disbursement.paymentSlipName || '');
      setFinanceRecordedBy(disbursement.financeRecordedBy || 'น.ส.กมลทิพย์ กรมทอง (ฝ่ายการเงิน)');
      setPayerSignature(disbursement.financeSignature || '');
    }
  }, [disbursement, isOpen, accountsList]);

  // Generate QR Code dynamically whenever documentLink changes
  useEffect(() => {
    if (documentLink && documentLink.trim().startsWith('http')) {
      QRCode.toDataURL(documentLink.trim(), { width: 140, margin: 1 })
        .then(url => setQrCodeUrl(url))
        .catch(() => setQrCodeUrl(''));
    } else {
      setQrCodeUrl('');
    }
  }, [documentLink]);

  // Handle Paste (Ctrl+V) anywhere in modal to grab slip screenshot
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
              const dataUrl = uploadEvent.target?.result as string;
              setPaymentSlipUrl(dataUrl);
              setPaymentSlipName(`slip_clipboard_${Date.now()}.png`);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen || !disbursement) return null;

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPaymentSlipUrl(dataUrl);
      setPaymentSlipName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const finalAmount = parseFloat(transferAmount) || disbursement.totalAmount;
    const finalFee = parseFloat(fee) || 0;

    // Generate or retain PV No
    const pvNumber = disbursement.pvNo || generatePVNumber(disbursements, paymentDate);
    const certId = disbursement.auditCertificateId || generateAuditCertificateId(disbursement.dbmNo);
    const nowIso = new Date().toISOString();

    onConfirmPayment(disbursement.id, {
      payerAccount: payerAccount.trim(),
      chequeNo: chequeNo.trim(),
      paymentDate: paymentDate.trim(),
      transferAmount: finalAmount,
      fee: finalFee,
      paymentMethod,
      documentLink: documentLink.trim(),
      paymentSlipUrl,
      paymentSlipName,
      financeRecordedBy: financeRecordedBy.trim(),
      financeSignature: payerSignature,
      pvNo: pvNumber,
      paidAt: nowIso,
      auditCertificateId: certId,
      status: 'paid'
    });

    onClose();
  };

  // Preset fast signature for Kamonthip
  const applyPresetSignature = () => {
    // Generate a clean stylized canvas signature
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      // Draw signature curve
      ctx.moveTo(30, 80);
      ctx.bezierCurveTo(60, 20, 90, 110, 140, 50);
      ctx.bezierCurveTo(170, 20, 200, 90, 260, 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(70, 70);
      ctx.lineTo(250, 70);
      ctx.stroke();
      const url = canvas.toDataURL('image/png');
      setPayerSignature(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-600 via-[#005aa9] to-blue-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-white shadow-inner shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-400 text-emerald-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                  STEP 2 & 3: PAYMENT WORKFLOW
                </span>
                <h2 className="text-base font-black tracking-tight">บันทึกการจ่ายเงิน & ออกใบสำคัญจ่าย (PV)</h2>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                เอกสาร DBM: <span className="font-mono font-bold text-white">{disbursement.dbmNo}</span> • โครงการ: {disbursement.project}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            {/* STEP 2: VERIFICATION CARD (ตรวจสอบยอดสุทธิและบัญชีผู้รับ) */}
          <div className="bg-linear-to-br from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                  2
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  ตรวจสอบยอดสุทธิ & ข้อมูลบัญชีผู้รับเงิน (Verification)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-bold text-[11px] rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                ผ่านการอนุมัติแล้ว
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payee Info */}
              <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-bold">ชื่อผู้รับเงิน (Payee)</div>
                <div className="text-sm font-black text-slate-900">{disbursement.payeeName}</div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>เลขบัญชี: {disbursement.payeeBankAccount || 'ไม่มีระบุ'}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  ประเภทงาน: <strong className="text-slate-800">{disbursement.expenseType}</strong> ({disbursement.company})
                </div>
              </div>

              {/* Net Total Breakdown */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold text-emerald-950">ยอดสุทธิที่ต้องชำระ (Net Total):</span>
                  <span className="text-[10px] text-emerald-700 font-medium">คำนวณหักภาษีครบถ้วน</span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-900 my-1">
                  {formatMoney(disbursement.totalAmount)}
                </div>
                <div className="text-[10px] text-emerald-800 flex items-center justify-between">
                  <span>ผู้ขอเบิก: {disbursement.recordedBy || '-'}</span>
                  <span>ผู้อนุมัติ: {disbursement.approverName || 'ฝ่ายบริหาร'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: PAYMENT DETAILS & LIVE SIGNATURE */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm">
                กรอกรายละเอียดการชำระเงินจริง & ลงนามสด
              </h3>
            </div>

            {/* Payment Method Selector (โอนเงิน / เช็ค / เงินสด) */}
            <div>
              <label className="font-bold text-slate-800 block mb-1.5">
                รูปแบบการชำระเงิน (Payment Method) *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'โอนเงินผ่านธนาคาร', label: 'โอนเงิน (Bank Transfer)', icon: CreditCard },
                  { id: 'เช็คสั่งจ่าย', label: 'เช็ค (Cheque)', icon: Building2 },
                  { id: 'เงินสด/เงินสดย่อย', label: 'เงินสด (Cash / Petty Cash)', icon: Banknote }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account & Cheque/Ref No. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  บัญชีธนาคารผู้สั่งจ่าย (Source Account) *
                </label>
                <select
                  value={payerAccount}
                  onChange={(e) => setPayerAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono text-xs font-bold text-slate-800"
                >
                  {accountsList.map((acc, i) => (
                    <option key={i} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {paymentMethod === 'เช็คสั่งจ่าย' ? 'เลขที่เช็คสั่งจ่าย *' : 'เลขที่ทำรายการ / เลขอ้างอิงสลิป / Ref'}
                </label>
                <input
                  type="text"
                  value={chequeNo}
                  onChange={(e) => setChequeNo(e.target.value)}
                  placeholder={paymentMethod === 'เช็คสั่งจ่าย' ? 'เช่น 01620875-1' : 'เช่น TXN202501158941'}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Date, Paid Amount & Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  วันที่จ่ายเงินจริง * (วว/ดด/ปปปป)
                </label>
                <input
                  type="text"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  placeholder="เช่น 15/01/2568"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ยอดเงินจ่ายจริง (บาท) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-600 font-mono font-black text-right text-emerald-950 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ค่าธรรมเนียมธนาคาร (บาท)
                </label>
                <input
                  type="number"
                  step="any"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-mono text-right"
                />
              </div>
            </div>

            {/* SLIP ATTACHMENT SECTION (รองรับ Drag & Drop, Ctrl+V, และ Drive Link) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-emerald-600" />
                  <span>แนบสลิปหลักฐานการโอนเงิน (Slip Attachment)</span>
                </label>
                <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  รองรับลากวาง หรือกด <kbd className="font-mono font-bold text-blue-700">Ctrl+V</kbd> เพื่อวางภาพสลิปทันที
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : paymentSlipUrl 
                    ? 'border-emerald-300 bg-emerald-50/40' 
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {paymentSlipUrl ? (
                  <div className="flex items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={paymentSlipUrl} 
                        alt="Payment Slip" 
                        className="w-12 h-12 object-cover rounded-lg border border-emerald-300" 
                      />
                      <div className="text-left">
                        <div className="font-bold text-emerald-950 truncate max-w-xs">{paymentSlipName || 'สลิปการโอนเงิน'}</div>
                        <div className="text-[10px] text-emerald-700">แนบหลักฐานสลิปเรียบร้อยแล้ว</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewSlip(true)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        ดูรูปสลิป
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSlipUrl('');
                          setPaymentSlipName('');
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">
                      คลิกเพื่อเลือกไฟล์ หรือลากสลิปมาวางที่นี่
                    </div>
                    <div className="text-[10px] text-slate-400">
                      รองรับไฟล์ภาพ JPG, PNG, PDF หรือคัดลอกรูปแล้วกด Ctrl+V
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Drive URL for QR Code */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Link className="w-3 h-3 text-[#005aa9]" />
                    <span>หรือแนบลิงก์ Google Drive สลิป (สร้าง QR Code บนเอกสาร PV อัตโนมัติ):</span>
                  </span>
                </div>
                <input
                  type="url"
                  value={documentLink}
                  onChange={(e) => setDocumentLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* PAYER LIVE SIGNATURE PAD (ผู้จ่ายเงินลงนามสด) */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <PenTool className="w-4 h-4 text-[#005aa9]" />
                    <span>ผู้จ่ายเงินลงนามสด (Payer Live Signature) *</span>
                  </label>
                  <p className="text-[10px] text-slate-500">
                    ลงนามรับรองการจ่ายเงินจริง ลายเซ็นนี้จะประทับบนใบสำคัญจ่าย (PV) และใบรับรองดิจิทัล
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={applyPresetSignature}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#005aa9] border border-blue-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    ใช้ลายเซ็นด่วน (การเงิน)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      ชื่อผู้บันทึกจ่ายเงิน (Payer Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={financeRecordedBy}
                      onChange={(e) => setFinanceRecordedBy(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-700">🔒 มาตรฐานความปลอดภัย:</div>
                    <div>• ระบบจะออกเลขอ้างอิงใบรับรองดิจิทัลแบบเข้ารหัส</div>
                    <div>• ประทับตรา **PAID** สีแดงบนเอกสาร A4 ทันที</div>
                  </div>
                </div>

                <div className="sm:col-span-7">
                  <SignaturePad
                    signerName={financeRecordedBy}
                    signatureDataUrl={payerSignature}
                    onSaveSignature={(sig) => setPayerSignature(sig)}
                    title="วาดลายเซ็นสดผู้จ่ายเงิน (เซ็นด้วยเมาส์หรือนิ้วมือ)"
                  />
                </div>
              </div>
            </div>

          </div>
          </div>

          {/* STEP 4 CONFIRMATION ACTIONS (Sticky Bottom Footer) */}
          <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              เมื่อกดยืนยัน ระบบจะเปลี่ยนสถานะเป็น <strong className="text-emerald-700">"จ่ายเงินแล้ว" (Paid)</strong> และออกเลขที่ใบสำคัญจ่าย <strong className="text-blue-700 font-mono">PV-xxxx</strong> พร้อมพิมพ์ได้ทันที
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-[#005aa9] hover:from-emerald-700 hover:to-[#004887] text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันบันทึกจ่ายเงิน (Confirm Payment & Issue PV)</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Slip Lightbox */}
      {previewSlip && paymentSlipUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewSlip(false)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="font-bold text-xs text-slate-800">พรีวิวหลักฐานการโอนเงิน (Payment Slip)</span>
              <button onClick={() => setPreviewSlip(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={paymentSlipUrl} 
              alt="Payment Slip Full" 
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl border border-slate-200 shadow-lg"
            />
          </div>
        </div>
      )}

    </div>
  );
}
