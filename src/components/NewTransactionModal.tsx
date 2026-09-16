import { useState, useEffect, FormEvent } from 'react';
import { Transaction, Disbursement } from '../types';
import { 
  X, 
  Save, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTransaction?: Transaction | null;
  disbursements?: Disbursement[];
  projectsList: string[];
  accountsList: string[];
  companiesList: string[];
  initialType?: 'expense' | 'income';
}

export function NewTransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  disbursements = [],
  projectsList,
  accountsList,
  companiesList,
  initialType = 'expense'
}: NewTransactionModalProps) {
  const [date, setDate] = useState('2026-08-29');
  const [docNo, setDocNo] = useState('');
  const [company, setCompany] = useState(companiesList[0] || 'บริษัท บุรีรัมย์ธงชัยก่อสร้าง จำกัด');
  const [account, setAccount] = useState(accountsList[0] || 'KTB BTC SA');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState(projectsList[0] || '(38)ทล.24 อ.ปราสาท-อ.สังขะ ตอน2 จ.สุรินทร์ (ปี2568)');
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [category, setCategory] = useState('ค่าวัสดุก่อสร้าง');
  const [amount, setAmount] = useState<string>('');
  const [remarks, setRemarks] = useState('');

  // Separated categories for Expense vs Income to prevent confusion
  const expenseCategories = [
    'ค่าวัสดุก่อสร้าง',
    'ค่าคอนกรีตผสมเสร็จ & ท่อระบายน้ำ',
    'ค่าเหล็กเส้น & ไวร์เมช',
    'ค่าหินคลุก & ทรายถม',
    'ค่าผลงานผู้รับเหมาช่วง',
    'งานสะพาน & โครงสร้าง',
    'งานกำแพงกันดิน MSE Wall',
    'ค่าน้ำมันเชื้อเพลิงดีเซล & หล่อลื่น',
    'ค่าอะไหล่ & ซ่อมบำรุงเครื่องจักร',
    'เงินเดือน & สำรองค่าแรง',
    'ภาษีหัก ณ ที่จ่าย ภ.ง.ด. 1, 3, 53',
    'ภาษีมูลค่าเพิ่ม ภ.พ.30',
    'เงินสมทบประกันสังคม (สปส.)',
    'กองทุน กยศ.',
    'ค่าสาธารณูปโภค (ไฟฟ้า, ประปา, สื่อสาร)',
    'ค่าธรรมเนียมธนาคาร, L/G, ดอกเบี้ยจ่าย',
    'โอนระหว่างบัญชีธนาคาร (ย้ายเงินสด)',
    'ค่าใช้จ่ายทั่วไป / เงินสดย่อย'
  ];

  const incomeCategories = [
    'รับค่างวดงานก่อสร้างทางหลวง',
    'รับค่างวดงานตามสัญญา',
    'รับเงินวางตั๋วสัญญาใช้เงิน (P/N)',
    'เงินให้กู้ยืม / คืนเงินยืมระหว่างกิจการ',
    'ดอกเบี้ยรับ & ผลตอบแทนเงินฝาก',
    'รายได้จากการขายเศษวัสดุ / เครื่องจักรเก่า',
    'โอนระหว่างบัญชีธนาคาร (ย้ายเงินสด)',
    'รายได้เบ็ดเตล็ดอื่น'
  ];

  // Helper date parser
  const parseToIsoDate = (dateStr?: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        let y = parseInt(parts[2], 10);
        if (y > 2500) y -= 543;
        return `${y}-${m}-${d}`;
      }
    }
    return new Date().toISOString().split('T')[0];
  };

  // Helper matching company
  const matchCompany = (compStr: string, list: string[]): string => {
    if (!compStr) return list[0] || '';
    const match = list.find(c => c.toLowerCase().includes(compStr.toLowerCase()) || compStr.toLowerCase().includes(c.toLowerCase()));
    if (match) return match;
    if (compStr.includes('BTC') || compStr.includes('บุรีรัมย์ธงชัย')) {
      return list.find(c => c.includes('บุรีรัมย์ธงชัย')) || list[0] || '';
    }
    if (compStr.includes('BTCP') || compStr.includes('บีทีซีพี')) {
      return list.find(c => c.includes('BTCP') || c.includes('บีทีซีพี')) || list[0] || '';
    }
    if (compStr.includes('BTC-PC') || compStr.includes('พีซี')) {
      return list.find(c => c.includes('BTC-PC') || c.includes('พีซี')) || list[0] || '';
    }
    if (compStr.includes('ไทย บุรีรัมย์') || compStr.includes('TBTC')) {
      return list.find(c => c.includes('ไทย บุรีรัมย์') || c.includes('TBTC')) || list[0] || '';
    }
    return list[0] || compStr;
  };

  // Helper matching project
  const matchProject = (projStr: string, list: string[]): string => {
    if (!projStr) return list[0] || '';
    if (list.includes(projStr)) return projStr;
    const match = list.find(p => {
      const pCode = p.match(/\((\d+)\)/)?.[1];
      const targetCode = projStr.match(/\((\d+)\)/)?.[1];
      if (pCode && targetCode && pCode === targetCode) return true;
      return p.toLowerCase().includes(projStr.toLowerCase()) || projStr.toLowerCase().includes(p.toLowerCase());
    });
    return match || list[0] || projStr;
  };

  // Helper matching category
  const matchCategory = (expenseType: string, boqType?: string): string => {
    const combined = `${expenseType} ${boqType || ''}`.toLowerCase();
    if (combined.includes('น้ำมัน') || combined.includes('ดีเซล') || combined.includes('เชื้อเพลิง')) {
      return 'ค่าน้ำมันเชื้อเพลิงดีเซล & หล่อลื่น';
    }
    if (combined.includes('คอนกรีต') || combined.includes('ท่อ') || combined.includes('ปูน')) {
      return 'ค่าคอนกรีตผสมเสร็จ & ท่อระบายน้ำ';
    }
    if (combined.includes('เหล็ก') || combined.includes('ไวร์เมช')) {
      return 'ค่าเหล็กเส้น & ไวร์เมช';
    }
    if (combined.includes('หิน') || combined.includes('ทราย') || combined.includes('ดิน')) {
      return 'ค่าหินคลุก & ทรายถม';
    }
    if (combined.includes('สะพาน') || combined.includes('โครงสร้าง')) {
      return 'งานสะพาน & โครงสร้าง';
    }
    if (combined.includes('กำแพง') || combined.includes('mse')) {
      return 'งานกำแพงกันดิน MSE Wall';
    }
    if (combined.includes('ซ่อม') || combined.includes('อะไหล่') || combined.includes('เครื่องจักร')) {
      return 'ค่าอะไหล่ & ซ่อมบำรุงเครื่องจักร';
    }
    if (combined.includes('เหมา') || combined.includes('ผู้รับเหมา')) {
      return 'ค่าผลงานผู้รับเหมาช่วง';
    }
    if (combined.includes('เงินเดือน') || combined.includes('แรง') || combined.includes('ค่าจ้าง')) {
      return 'เงินเดือน & สำรองค่าแรง';
    }
    if (combined.includes('ภาษี') || combined.includes('ภ.ง.ด') || combined.includes('ภงด')) {
      return 'ภาษีหัก ณ ที่จ่าย ภ.ง.ด. 1, 3, 53';
    }
    if (combined.includes('ประกันสังคม') || combined.includes('สปส')) {
      return 'เงินสมทบประกันสังคม (สปส.)';
    }
    return 'ค่าวัสดุก่อสร้าง';
  };

  // Handle DocNo change with seamless automatic data lookup
  const handleDocNoChange = (newDocNo: string) => {
    setDocNo(newDocNo);

    // Only auto-lookup if user entered at least 3 characters and is expense type
    if (type === 'expense' && newDocNo.trim().length >= 3 && disbursements.length > 0) {
      const clean = newDocNo.trim().toLowerCase();
      const matched = disbursements.find(d => 
        d.dbmNo.toLowerCase() === clean ||
        (d.pvNo && d.pvNo.toLowerCase() === clean) ||
        (d.refDocNo && d.refDocNo.toLowerCase() === clean) ||
        (d.chequeNo && d.chequeNo.toLowerCase() === clean)
      );

      if (matched) {
        // Auto fill fields
        const rawDate = matched.paymentDate || matched.entryDate;
        if (rawDate) setDate(parseToIsoDate(rawDate));
        
        if (matched.company) setCompany(matchCompany(matched.company, companiesList));

        if (matched.payerAccount) {
          const matchAcc = accountsList.find(a => 
            a.toLowerCase().includes(matched.payerAccount.toLowerCase()) || 
            matched.payerAccount.toLowerCase().includes(a.toLowerCase())
          );
          if (matchAcc) setAccount(matchAcc);
        }

        const pvText = matched.pvNo ? ` / PV: ${matched.pvNo}` : '';
        const itemDesc = matched.items && matched.items.length > 0 
          ? matched.items.map(i => i.description).filter(Boolean).join(', ') 
          : '';
        const detailPart = itemDesc || matched.expenseType || 'ค่าใช้จ่ายตามใบตั้งเบิก';
        setDescription(`[ใบตั้งเบิก ${matched.dbmNo}${pvText}] ${matched.payeeName} - ${detailPart}`);

        if (matched.project) setProject(matchProject(matched.project, projectsList));

        setCategory(matchCategory(matched.expenseType, matched.boqType));

        const netAmount = (matched.transferAmount && matched.transferAmount > 0) 
          ? matched.transferAmount 
          : (matched.totalAmount - (matched.taxDeductionTotalAmount || 0) - (matched.retentionTotalAmount || 0));
        setAmount(netAmount > 0 ? netAmount.toString() : (matched.totalAmount || 0).toString());

        const whtText = matched.taxDeductionTotalAmount && matched.taxDeductionTotalAmount > 0 
          ? `หัก ณ ที่จ่าย: ${matched.taxDeductionTotalAmount.toLocaleString()}` 
          : '';
        const bankText = matched.payeeBankAccount ? `บช.ผู้รับ: ${matched.payeeBankName || ''} ${matched.payeeBankAccount}` : '';
        const chqText = matched.chequeNo ? `เช็ค/Ref: ${matched.chequeNo}` : '';
        const remarksCombined = [matched.remarks, bankText, whtText, chqText].filter(Boolean).join(' | ');
        setRemarks(remarksCombined);
      }
    }
  };

  // Reset form when modal opens or editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.isoDate || '2026-08-29');
      setDocNo(editingTransaction.docNo || '');
      setCompany(editingTransaction.company || companiesList[0]);
      setAccount(editingTransaction.account || accountsList[0]);
      setDescription(editingTransaction.description || '');
      setProject(editingTransaction.project || projectsList[0]);
      setCategory(editingTransaction.category || 'ค่าวัสดุก่อสร้าง');
      if (editingTransaction.debit > 0) {
        setType('income');
        setAmount(editingTransaction.debit.toString());
      } else {
        setType('expense');
        setAmount(editingTransaction.credit.toString());
      }
      setRemarks(editingTransaction.remarks || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setDocNo('');
      setDescription('');
      setAmount('');
      setRemarks('');
      const targetType = initialType || 'expense';
      setType(targetType);
      setCategory(targetType === 'income' ? incomeCategories[0] : expenseCategories[0]);
    }
  }, [editingTransaction, isOpen, initialType]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }

    const [y, m, d] = date.split('-');
    const thaiYear = parseInt(y, 10) + 543;
    const formattedThaiDate = `${d}/${m}/${thaiYear}`;

    const newTx: Omit<Transaction, 'id' | 'createdAt'> = {
      date: formattedThaiDate,
      isoDate: date,
      docNo: docNo.trim(),
      company,
      account,
      description: description.trim(),
      project,
      category: category.trim(),
      debit: type === 'income' ? numAmount : 0,
      credit: type === 'expense' ? numAmount : 0,
      remarks: remarks.trim()
    };

    onSave(newTx, editingTransaction?.id);
    onClose();
  };

  const isExpense = type === 'expense';
  const activeCategories = isExpense ? expenseCategories : incomeCategories;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className={`bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full border shadow-2xl overflow-hidden max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 ${
        isExpense ? 'border-rose-300' : 'border-emerald-300'
      }`}>
        
        {/* Modal Header - Dynamically themed to prevent confusion */}
        <div className={`px-5 sm:px-6 py-3.5 border-b flex items-center justify-between shrink-0 transition-colors ${
          isExpense 
            ? 'bg-gradient-to-r from-rose-50 via-rose-50/70 to-slate-50 border-rose-200' 
            : 'bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-slate-50 border-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs border ${
              isExpense 
                ? 'bg-rose-100 text-rose-700 border-rose-200' 
                : 'bg-emerald-100 text-[#009540] border-emerald-200'
            }`}>
              {isExpense ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  {editingTransaction 
                    ? `แก้ไขรายการ: ${isExpense ? '🔴 รายจ่าย (Cr.)' : '🟢 รายรับ (Dr.)'}` 
                    : isExpense ? '🔴 แบบฟอร์มบันทึกรายจ่าย (Expense / Cr.)' : '🟢 แบบฟอร์มบันทึกรายรับ (Income / Dr.)'
                  }
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isExpense 
                    ? 'bg-rose-100 text-rose-800 border-rose-300' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isExpense ? 'เงินจ่ายออก (Cr.)' : 'เงินรับเข้า (Dr.)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isExpense 
                  ? 'ตัดเงินออกจากบัญชีธนาคาร • ยอดเงินจะบันทึกในช่องเครดิต (Credit)' 
                  : 'นำเงินเข้าบัญชีธนาคาร • ยอดเงินจะบันทึกในช่องเดบิต (Debit)'
                }
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

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs">
          
          {/* Dedicated Locked Form Header Indicator - No Switch Tabs to Prevent Confusion */}
          {isExpense ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs text-rose-950 flex items-center gap-1.5">
                    <span>🔴 แบบฟอร์มบันทึกรายจ่าย (Expense / Cr.)</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-200 text-rose-900 font-bold">บันทึกเครดิต (Cr.)</span>
                  </div>
                  <div className="text-[11px] text-rose-700">
                    เงินจ่ายออกจากบัญชีธนาคาร • ยอดเงินจะบันทึกเข้าช่อง <strong>เครดิต (Credit)</strong> ในสมุดบัญชี
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#009540] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                    <span>🟢 แบบฟอร์มบันทึกรายรับ (Income / Dr.)</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-200 text-emerald-900 font-bold">บันทึกเดบิต (Dr.)</span>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    เงินเข้าบัญชีธนาคาร • ยอดเงินจะบันทึกเข้าช่อง <strong>เดบิต (Debit)</strong> ในสมุดบัญชี
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <form id="ledger-form" onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">วันที่ทำรายการ *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-medium"
                />
              </div>

              {/* Doc No with contextual label */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isExpense ? 'เลขที่ใบสำคัญจ่าย / DBM / PV / เช็ค' : 'เลขที่ใบเสร็จรับเงิน / ใบแจ้งหนี้ / ค่างวด'}
                </label>
                <input
                  type="text"
                  value={docNo}
                  onChange={(e) => handleDocNoChange(e.target.value)}
                  placeholder={isExpense ? "เช่น DBM-2568-001, PV68-08-012" : "เช่น REC-2568-001, งวดที่ 1"}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-mono font-medium"
                />
                {isExpense && (
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    * พิมพ์เลข DBM หรือ PV เพื่อดึงข้อมูลอัตโนมัติ
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Company */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">บริษัท / กิจการร่วมค้า *</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
                >
                  {companiesList.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Bank Account */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isExpense ? '🔴 ตัดจ่ายจากบัญชีธนาคาร (เงินออก)' : '🟢 นำฝากเข้าบัญชีธนาคาร (เงินเข้า)'} *
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 font-medium ${
                    isExpense 
                      ? 'border-rose-200 focus:ring-rose-500' 
                      : 'border-emerald-200 focus:ring-emerald-500'
                  }`}
                >
                  {accountsList.map((a, i) => (
                    <option key={i} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isExpense ? 'รายละเอียดรายจ่าย / ผู้รับเงิน / ร้านค้า *' : 'รายละเอียดรายรับ / แหล่งที่มา / ผู้ว่าจ้าง *'}
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isExpense ? "เช่น ค่าเหล็กเส้น บริษัท เหล็กสยาม จำกัด (ส่งงานสะพาน)" : "เช่น รับค่างวดงานทางหลวงงวดที่ 4 ตอนที่ 2"}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9] font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Project */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">โครงการ / หน่วยงาน *</label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
                >
                  {projectsList.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Category (Filtered specifically for Expense vs Income) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    หมวดหมู่บัญชี {isExpense ? '(รายจ่าย)' : '(รายรับ)'} *
                  </label>
                  <span className={`text-[10px] font-semibold ${isExpense ? 'text-rose-600' : 'text-[#009540]'}`}>
                    {isExpense ? 'หมวดต้นทุนงาน' : 'หมวดรายรับ'}
                  </span>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 font-medium ${
                    isExpense 
                      ? 'border-rose-200 focus:ring-rose-500' 
                      : 'border-emerald-200 focus:ring-emerald-500'
                  }`}
                >
                  {activeCategories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount Field - Highlighted with Mode Color to Eliminate Errors */}
            <div className={`p-3 rounded-xl border ${
              isExpense 
                ? 'bg-rose-50/50 border-rose-200' 
                : 'bg-emerald-50/50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <label className={`font-bold flex items-center gap-1.5 ${
                  isExpense ? 'text-rose-900' : 'text-emerald-900'
                }`}>
                  {isExpense ? <ArrowDownLeft className="w-4 h-4 text-rose-600" /> : <ArrowUpRight className="w-4 h-4 text-[#009540]" />}
                  <span>{isExpense ? 'จำนวนเงินที่จ่าย (บาท - เครดิต Cr.) *' : 'จำนวนเงินที่รับเข้า (บาท - เดบิต Dr.) *'}</span>
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isExpense 
                    ? 'bg-rose-100 text-rose-700 border-rose-300' 
                    : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                }`}>
                  {isExpense ? '🔴 ยอดเงินตัดออก' : '🟢 ยอดเงินฝากเข้า'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:ring-2 text-lg font-black font-mono shadow-inner ${
                    isExpense 
                      ? 'border-rose-300 text-rose-700 focus:ring-rose-500 focus:border-rose-500' 
                      : 'border-emerald-300 text-emerald-700 focus:ring-[#009540] focus:border-[#009540]'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                  THB
                </span>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">หมายเหตุเพิ่มเติม</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="หมายเหตุเพิ่มเติม หรือรายละเอียดบัญชีปลายทาง (ถ้ามี)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#005aa9]"
              />
            </div>
          </form>
        </div>

        {/* Footer Buttons - Clearly themed */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] font-medium text-slate-500">
            สถานะ: {isExpense ? (
              <span className="text-rose-600 font-bold">🔴 บันทึกรายจ่าย (Cr.)</span>
            ) : (
              <span className="text-[#009540] font-bold">🟢 บันทึกรายรับ (Dr.)</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold cursor-pointer transition-colors text-xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form="ledger-form"
              className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all text-xs ${
                isExpense 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-700/20' 
                  : 'bg-[#009540] hover:bg-[#007f36] shadow-emerald-700/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {editingTransaction 
                  ? 'บันทึกการแก้ไข' 
                  : isExpense ? '🔴 ยืนยันบันทึกรายจ่าย (Cr.)' : '🟢 ยืนยันบันทึกรายรับ (Dr.)'
                }
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
