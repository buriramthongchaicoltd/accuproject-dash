import { useState, useEffect, FormEvent } from 'react';
import { Disbursement, DisbursementItem, DisbursementAttachment } from '../types';
import { 
  X, Save, Plus, Trash2, FileText, Calculator, Building2, 
  Send, PenTool, CheckCircle2, Percent, Paperclip, AlertCircle 
} from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { FileUploadZone } from './FileUploadZone';
import { numberToThaiBaht } from '../utils/thaiBahtText';

interface NewDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (disbursement: Omit<Disbursement, 'id'>, existingId?: string) => void;
  editingDisbursement?: Disbursement | null;
  projectsList: string[];
  companiesList: string[];
  accountsList: string[];
}

export function NewDisbursementModal({
  isOpen,
  onClose,
  onSave,
  editingDisbursement,
  projectsList,
  companiesList,
  accountsList
}: NewDisbursementModalProps) {
  // [ 2. กรอกข้อมูลเอกสาร ]
  const [recordedBy, setRecordedBy] = useState('น.ส.ปวีณา ใยอุ่น');
  const [dbmNo, setDbmNo] = useState('');
  const [refDocNo, setRefDocNo] = useState('');
  const [company, setCompany] = useState(companiesList[0] || 'BTC');
  const [entryDate, setEntryDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [expenseType, setExpenseType] = useState('จ่ายชำระ ค่าวัสดุก่อสร้าง');
  const [boqType, setBoqType] = useState('งานโครงสร้างและวัสดุ');
  const [payeeName, setPayeeName] = useState('');
  const [payeeBankAccount, setPayeeBankAccount] = useState('');
  const [project, setProject] = useState(projectsList[0] || '(38) ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)');
  const [paymentMethod, setPaymentMethod] = useState('โอน');
  const [remarks, setRemarks] = useState('');

  // Structured Items: description, unitPrice, quantity, amount, vatRate, withholdingTaxRate
  const [items, setItems] = useState<DisbursementItem[]>([
    { description: 'ค่าวัสดุก่อสร้าง / งานเหมา', quantity: 1, unitPrice: 0, amount: 0, vatRate: 0, withholdingTaxRate: 0 }
  ]);

  // Attachments
  const [attachments, setAttachments] = useState<DisbursementAttachment[]>([]);

  // [ 3. ลงนามสดผู้ขอเบิก (Requester Live Signature) ]
  const [requesterSignature, setRequesterSignature] = useState('');

  // Keep existing finance fields untouched if editing
  const [payerAccount, setPayerAccount] = useState(accountsList[0] || 'BBL #297-3-033893');
  const [chequeNo, setChequeNo] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [transferAmount, setTransferAmount] = useState<number | undefined>(undefined);
  const [fee, setFee] = useState<number>(0);
  const [documentLink, setDocumentLink] = useState<string | undefined>(undefined);
  const [financeRecordedBy, setFinanceRecordedBy] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Disbursement['status']>('pending_review');

  useEffect(() => {
    if (editingDisbursement) {
      setRecordedBy(editingDisbursement.recordedBy || 'น.ส.ปวีณา ใยอุ่น');
      setDbmNo(editingDisbursement.dbmNo || '');
      setRefDocNo(editingDisbursement.refDocNo || '');
      setCompany(editingDisbursement.company || 'BTC');
      setEntryDate(editingDisbursement.entryDate || '');
      setDueDate(editingDisbursement.dueDate || '');
      setExpenseType(editingDisbursement.expenseType || '');
      setBoqType(editingDisbursement.boqType || editingDisbursement.expenseType || '');
      setPayeeName(editingDisbursement.payeeName || '');
      setPayeeBankAccount(editingDisbursement.payeeBankAccount || '');
      setProject(editingDisbursement.project || projectsList[0]);
      setPaymentMethod(editingDisbursement.paymentMethod || 'โอน');
      setRemarks(editingDisbursement.remarks || '');
      
      setItems(
        editingDisbursement.items && editingDisbursement.items.length > 0
          ? editingDisbursement.items.map(it => ({
              description: it.description || '',
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice || it.amount || 0,
              amount: it.amount || 0,
              vatRate: it.vatRate || 0,
              withholdingTaxRate: it.withholdingTaxRate || 0
            }))
          : [{ description: editingDisbursement.expenseType || '', quantity: 1, unitPrice: editingDisbursement.totalAmount, amount: editingDisbursement.totalAmount, vatRate: 0, withholdingTaxRate: 0 }]
      );
      
      setAttachments(editingDisbursement.attachments || []);
      setRequesterSignature(editingDisbursement.requesterSignature || '');
      setPayerAccount(editingDisbursement.payerAccount || accountsList[0]);
      setChequeNo(editingDisbursement.chequeNo || '');
      setPaymentDate(editingDisbursement.paymentDate || '');
      setTransferAmount(editingDisbursement.transferAmount);
      setFee(editingDisbursement.fee || 0);
      setDocumentLink(editingDisbursement.documentLink);
      setFinanceRecordedBy(editingDisbursement.financeRecordedBy);
      setStatus(editingDisbursement.status || 'pending_review');
    } else {
      // Initialize fresh new voucher
      const today = new Date();
      const thaiYear = today.getFullYear() + 543;
      const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${thaiYear}`;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedDbm = `DBM26${String(today.getMonth() + 1).padStart(2, '0')}${randomNum}`;

      setRecordedBy('น.ส.ปวีณา ใยอุ่น');
      setDbmNo(generatedDbm);
      setRefDocNo(`PS690${randomNum.toString().substring(0, 3)}`);
      setCompany('BTC');
      setEntryDate(formattedDate);
      setDueDate('');
      setExpenseType('จ่ายชำระ ค่าวัสดุก่อสร้าง');
      setBoqType('งานโครงสร้างและวัสดุ');
      setPayeeName('');
      setPayeeBankAccount('');
      setProject('(38) ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)');
      setPaymentMethod('โอน');
      setRemarks('');
      setItems([{ description: 'ค่าวัสดุก่อสร้าง / งานเหมา', quantity: 1, unitPrice: 0, amount: 0, vatRate: 0, withholdingTaxRate: 0 }]);
      setAttachments([]);
      setRequesterSignature('');
      setPayerAccount(accountsList[0] || 'BBL #297-3-033893');
      setChequeNo('');
      setPaymentDate('');
      setTransferAmount(undefined);
      setFee(0);
      setDocumentLink(undefined);
      setFinanceRecordedBy(undefined);
      setStatus('pending_review');
    }
  }, [editingDisbursement, isOpen, accountsList, projectsList, companiesList]);

  if (!isOpen) return null;

  // Calculate sum of items
  const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const thaiText = numberToThaiBaht(calculatedTotal);

  const handleAddItem = () => {
    if (items.length >= 10) {
      alert('สามารถเพิ่มรายการย่อยได้สูงสุด 10 รายการ');
      return;
    }
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0, vatRate: 0, withholdingTaxRate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert('ต้องมีอย่างน้อย 1 รายการ');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DisbursementItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index] };

    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) || 0 : target.quantity || 1;
      const price = field === 'unitPrice' ? Number(value) || 0 : target.unitPrice || 0;
      target[field] = Number(value) || 0;
      target.amount = Number((qty * price).toFixed(2));
    } else if (field === 'amount') {
      target.amount = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0;
      target.unitPrice = target.amount;
      target.quantity = 1;
    } else {
      (target as any)[field] = value;
    }

    updated[index] = target;
    setItems(updated);
  };

  // Helper auto tax deduction & VAT buttons
  const applyTaxDeduction = (rate: number) => {
    const baseAmount = items[0]?.amount || 0;
    if (baseAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินในรายการแรกก่อนคำนวณภาษีหัก ณ ที่จ่าย');
      return;
    }
    const taxAmt = -(baseAmount * rate);
    const taxDesc = `หัก ภาษีหัก ณ ที่จ่าย (${rate * 100}%)`;
    setItems([...items, { description: taxDesc, quantity: 1, unitPrice: taxAmt, amount: Number(taxAmt.toFixed(2)) }]);
  };

  const applyVat7 = () => {
    const baseAmount = items[0]?.amount || 0;
    if (baseAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินในรายการแรกก่อนคำนวณ VAT 7%');
      return;
    }
    const vatAmt = baseAmount * 0.07;
    const vatDesc = `ภาษีมูลค่าเพิ่ม VAT 7%`;
    setItems([...items, { description: vatDesc, quantity: 1, unitPrice: vatAmt, amount: Number(vatAmt.toFixed(2)) }]);
  };

  const applyRetentionDeduction = (rate: number = 0.05) => {
    const baseAmount = items[0]?.amount || 0;
    if (baseAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินในรายการแรกก่อนคำนวณหักเงินประกันผลงาน');
      return;
    }
    const retAmt = -(baseAmount * rate);
    const retDesc = `หัก เงินประกันผลงาน (${rate * 100}%)`;
    setItems([...items, { description: retDesc, quantity: 1, unitPrice: retAmt, amount: Number(retAmt.toFixed(2)) }]);
  };

  // [ 4. บันทึกและส่งเอกสาร ]
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!dbmNo.trim()) {
      alert('กรุณาระบุเลขที่เอกสาร DBM');
      return;
    }
    if (!payeeName.trim()) {
      alert('กรุณาระบุชื่อผู้รับเงิน / บริษัทคู่ค้า');
      return;
    }
    if (calculatedTotal <= 0) {
      if (!confirm('ยอดรวมสุทธิเป็น 0 หรือติดลบ คุณแน่ใจหรือไม่ว่าต้องการบันทึก?')) {
        return;
      }
    }

    const data: Omit<Disbursement, 'id'> = {
      recordedBy: recordedBy.trim(),
      dbmNo: dbmNo.trim(),
      refDocNo: refDocNo.trim(),
      company,
      entryDate: entryDate.trim(),
      dueDate: dueDate.trim(),
      expenseType: expenseType.trim(),
      boqType: boqType.trim(),
      payeeName: payeeName.trim(),
      payeeBankAccount: payeeBankAccount.trim(),
      project,
      paymentMethod,
      remarks: remarks.trim(),
      items: items.filter(it => it.description.trim() !== '' || it.amount !== 0),
      totalAmount: calculatedTotal,
      
      // Step 3: Requester Live Signature & Attachments
      requesterSignature: requesterSignature || undefined,
      requesterSignedAt: requesterSignature ? new Date().toISOString() : undefined,
      attachments: attachments,

      // Step 4: Status becomes "pending_review" (รอตรวจสอบ)
      status: editingDisbursement?.status === 'paid' ? 'paid' : 'pending_review',

      payerAccount: payerAccount.trim(),
      chequeNo: chequeNo.trim(),
      paymentDate: paymentDate.trim(),
      transferAmount: transferAmount,
      fee: fee,
      documentLink: documentLink?.trim() || undefined,
      financeRecordedBy: financeRecordedBy?.trim() || undefined,
      isSyncedToLedger: status === 'paid'
    };

    onSave(data, editingDisbursement?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-50 via-white to-blue-50 border-b border-emerald-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#009540] flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingDisbursement ? 'แก้ไขใบขอตั้งเบิก' : '+ สร้างใบขอตั้งเบิกใหม่'}
                </h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md flex items-center gap-1">
                  <Send className="w-3 h-3 text-amber-700" />
                  รอส่งตรวจสอบ (Step 1-4)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                ขั้นตอน: [ 1. สร้าง ] → [ 2. กรอกข้อมูลและแนบไฟล์ ] → [ 3. เซ็นชื่อสด ] → [ 4. ส่งต่อไปยังผู้ตรวจสอบ ]
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

        {/* Workflow Progress Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-600 font-medium shrink-0">
          <div className="flex items-center gap-1.5 text-[#009540] font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">1</span>
            <span>กรอกข้อมูล & รายการ</span>
          </div>
          <div className="text-slate-300">→</div>
          <div className="flex items-center gap-1.5 text-[#005aa9] font-bold">
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">2</span>
            <span>แนบใบเสนอราคา/บิล</span>
          </div>
          <div className="text-slate-300">→</div>
          <div className="flex items-center gap-1.5 text-purple-700 font-bold">
            <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-xs">3</span>
            <span>ลงนามสดผู้ขอเบิก</span>
          </div>
          <div className="text-slate-300">→</div>
          <div className="flex items-center gap-1.5 text-amber-700 font-bold">
            <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs">4</span>
            <span>ส่งไปเมนู "ตรวจสอบ/อนุมัติ"</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* [ 2.1 ข้อมูลเอกสารหลัก: บริษัท, โครงการ, ผู้บันทึก ] */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">เลขที่เอกสาร DBM *</label>
              <input
                type="text"
                required
                value={dbmNo}
                onChange={(e) => setDbmNo(e.target.value)}
                placeholder="เช่น DBM26080001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">เลขที่เอกสารอ้างอิง</label>
              <input
                type="text"
                value={refDocNo}
                onChange={(e) => setRefDocNo(e.target.value)}
                placeholder="เช่น PS6900772, OE69..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">เลือกบริษัท (Company) *</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-bold text-slate-800"
              >
                {companiesList.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ชื่อผู้ขอเบิก (Requester) *</label>
              <input
                type="text"
                required
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                placeholder="เช่น น.ส.ปวีณา ใยอุ่น"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-bold"
              />
            </div>
          </div>

          {/* Dates & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">วันที่เอกสารตั้งเบิก *</label>
              <input
                type="text"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                placeholder="เช่น 29/08/2569"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">วันครบกำหนดจ่าย (Due Date)</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="เช่น 05/09/2569"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">เลือกโครงการ (Project) *</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-medium"
              >
                {projectsList.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* [ 2.2 ข้อมูลผู้รับเงิน (Payee) ] */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>ข้อมูลผู้รับเงิน & รูปแบบการจ่าย (Payee)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อผู้รับเงิน / ร้านค้า (Payee) *</label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="เช่น หจก.รุ่งเรืองวัสดุ หรือ นายสมชาย"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">บัญชีธนาคารปลายทาง</label>
                <input
                  type="text"
                  value={payeeBankAccount}
                  onChange={(e) => setPayeeBankAccount(e.target.value)}
                  placeholder="เช่น BBL 123-4-567890 (สาขาบุรีรัมย์)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">รูปแบบการจ่าย</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
                >
                  <option value="โอน">โอนเงินเข้าบัญชี (Transfer)</option>
                  <option value="เงินสด">เงินสด (Cash)</option>
                  <option value="เช็ค">เช็คธนาคาร (Cheque)</option>
                  <option value="บริษัท">บัญชีบริษัท (Company Account)</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ประเภทรายจ่าย</label>
                <input
                  type="text"
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value)}
                  placeholder="เช่น จ่ายชำระ ค่าวัสดุก่อสร้าง, ค่าจ้างเหมาแรงงาน"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ประเภทงาน (BOQ)</label>
                <input
                  type="text"
                  value={boqType}
                  onChange={(e) => setBoqType(e.target.value)}
                  placeholder="เช่น งานโครงสร้างและวัสดุ, งานผิวทางแอสฟัลต์"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* [ 2.3 รายการเบิก: จำนวน, ราคา, ภาษี ณ ที่จ่าย, VAT 7% ] */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  เพิ่มรายการเบิก (จำนวน, ราคา, ภาษี ณ ที่จ่าย, VAT 7%)
                </h4>
                <p className="text-[10px] text-slate-500">
                  คำนวณจำนวน x ราคาอัตโนมัติ พร้อมปุ่มลัดหักภาษี 1%, 3% และเพิ่ม VAT 7%
                </p>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={applyVat7}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"
                  title="เพิ่มภาษีมูลค่าเพิ่ม VAT 7%"
                >
                  <Percent className="w-3 h-3 text-blue-600" />
                  + VAT 7%
                </button>
                <button
                  type="button"
                  onClick={() => applyTaxDeduction(0.01)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer"
                  title="หักภาษี ณ ที่จ่าย 1% (ค่าขนส่ง/บริการตามสัญญา)"
                >
                  - หัก 1%
                </button>
                <button
                  type="button"
                  onClick={() => applyTaxDeduction(0.03)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer"
                  title="หักภาษี ณ ที่จ่าย 3% (ค่าบริการ/รับจ้างทำของ)"
                >
                  - หัก 3%
                </button>
                <button
                  type="button"
                  onClick={() => applyRetentionDeduction(0.05)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[10px] font-bold cursor-pointer"
                  title="หักเงินประกันผลงาน 5% (Retention)"
                >
                  - ค้ำประกัน 5%
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 bg-[#005aa9] hover:bg-[#004887] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  เพิ่มแถว
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="w-5 text-center font-mono text-slate-400 font-bold text-[11px] shrink-0">
                    {index + 1}.
                  </span>
                  
                  {/* Item Description */}
                  <input
                    type="text"
                    required
                    placeholder="รายละเอียด เช่น ค่าเหล็กเส้นกลม RB9"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
                  />

                  {/* Qty */}
                  <div className="w-20 shrink-0">
                    <input
                      type="number"
                      step="any"
                      placeholder="จำนวน"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-right text-xs"
                      title="จำนวน (Quantity)"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="w-28 shrink-0">
                    <input
                      type="number"
                      step="any"
                      placeholder="ราคา/หน่วย"
                      value={item.unitPrice || ''}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-right text-xs"
                      title="ราคาต่อหน่วย (Unit Price)"
                    />
                  </div>

                  {/* Calculated Amount */}
                  <div className="relative w-36 shrink-0">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="รวมเงิน"
                      value={item.amount || ''}
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl font-mono text-right font-bold ${
                        item.amount < 0 
                          ? 'bg-red-50 border-red-200 text-red-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      title="รวมเงินตามรายการ"
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total Amount preview & Thai Baht representation */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
              <div className="text-[11px] text-emerald-900 font-medium">
                <span className="font-bold">จำนวนเงินตัวอักษร:</span> {thaiText}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-600 block">ยอดรวมสุทธิขอเบิกจ่าย</span>
                <span className="text-lg font-black text-emerald-900 font-mono">
                  {calculatedTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* [ 2.4 แนบเอกสารหลักฐาน / ใบเสนอราคา / ใบแจ้งหนี้ (รองรับ Ctrl+V) ] */}
          <FileUploadZone
            attachments={attachments}
            onChange={(newAtts) => setAttachments(newAtts)}
          />

          {/* [ 3. ลงนามสดผู้ขอเบิก (Requester Live Signature) ] */}
          <SignaturePad
            signerName={recordedBy}
            signatureDataUrl={requesterSignature}
            onSaveSignature={(dataUrl) => setRequesterSignature(dataUrl)}
            title="3. ลงนามสดผู้ขอเบิก (Requester Live Signature)"
          />

          {/* Remarks */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">หมายเหตุเพิ่มเติม</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="เช่น แนบใบส่งของเลขที่ 4567, ส่งมอบงานงวดที่ 2 แล้ว"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
            />
          </div>
          </div>

          {/* Footer Actions [ 4. บันทึกและส่งเอกสาร ] (Sticky Bottom Footer) */}
          <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div className="text-[11px] text-slate-500">
              * เมื่อบันทึกแล้ว เอกสารจะอยู่ในสถานะ <strong className="text-amber-700">"รอตรวจสอบ" (Pending Review)</strong> และส่งต่อให้ผู้มีอำนาจในเมนูตรวจสอบ/อนุมัติ
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold cursor-pointer transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#009540] hover:bg-[#007e36] text-white font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>{editingDisbursement ? 'บันทึกการแก้ไข' : 'บันทึกและส่งขออนุมัติ (Submit Voucher)'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
