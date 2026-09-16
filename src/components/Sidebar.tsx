import { 
  LayoutDashboard, 
  ReceiptText, 
  FolderKanban, 
  WalletCards, 
  FileSpreadsheet, 
  CheckSquare, 
  Download, 
  Upload, 
  Sparkles, 
  FileCheck2, 
  X, 
  TrendingUp, 
  CreditCard,
  Database,
  Briefcase,
  BarChart3,
  HardHat,
  Lock,
  ShieldCheck,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { ViewTab, UserRole } from '../types';
import { BTCLogo } from './BTCLogo';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAI: () => void;
  onExportCSV: () => void;
  onImportCSVClick: () => void;
  onOpenSupabaseSettings?: () => void;
  isSupabaseConnected?: boolean;
  userRole?: UserRole;
  onOpenAuthModal?: () => void;
  totalTransactionsCount: number;
  pendingTasksCount: number;
  disbursementsCount?: number;
  pendingDisbursementsCount?: number;
  netBalance: number;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenAI,
  onExportCSV,
  onImportCSVClick,
  onOpenSupabaseSettings,
  isSupabaseConnected = false,
  userRole = 'executive',
  onOpenAuthModal,
  totalTransactionsCount,
  pendingTasksCount,
  disbursementsCount = 0,
  pendingDisbursementsCount = 0,
  netBalance
}: SidebarProps) {
  const handleSelect = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const formattedBalance = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(netBalance);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 shadow-xl lg:shadow-none transition-transform duration-200 ease-in-out shrink-0
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-14 px-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <BTCLogo size="sm" showText={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 tracking-tight truncate">
                  BTC ก่อสร้าง & บัญชี
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-[#009540] shrink-0">
                  ERP
                </span>
              </div>
              <span className="text-[10px] text-slate-500 truncate block">
                บจก. บุรีรัมย์ธงชัยก่อสร้าง
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">

          {/* ZONE 1: ฝ่ายบริหารองค์กร (Executive Suite) */}
          <div className="space-y-1">
            <div className="px-1.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-amber-600 shrink-0" />
                ฝ่ายบริหารองค์กร
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded border font-bold bg-amber-50 text-amber-900 border-amber-300">
                ผู้บริหาร
              </span>
            </div>

            <div className="space-y-0.5 pt-0.5">
              {/* 1. Executive Dashboard */}
              <button
                onClick={() => handleSelect('dashboard')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'dashboard' ? 'text-white' : 'text-amber-600'}`} />
                  <span className="truncate">แดชบอร์ดภาพรวมผู้บริหาร</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  currentTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                }`}>
                  Overview
                </span>
              </button>

              {/* 2. Financial Reports & P&L */}
              <button
                onClick={() => handleSelect('reports')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'reports'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'reports' ? 'text-white' : 'text-amber-600'}`} />
                  <span className="truncate">รายงานการเงิน & P&L</span>
                </div>
              </button>

              {/* 3. AI Financial Advisor */}
              <button
                onClick={() => handleSelect('ai_analysis')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'ai_analysis'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'ai_analysis' ? 'text-white' : 'text-amber-600'}`} />
                  <span className="truncate">AI วิเคราะห์งบการเงิน</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  currentTab === 'ai_analysis'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  AI
                </span>
              </button>
            </div>
          </div>

          {/* ZONE 2: ฝ่ายโครงการก่อสร้าง (Project Operations) */}
          <div className="space-y-1 pt-1 border-t border-slate-200">
            <div className="px-1.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                <FolderKanban className="w-3 h-3 text-[#005aa9] shrink-0" />
                ฝ่ายโครงการก่อสร้าง
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded border font-bold bg-blue-50 text-[#005aa9] border-blue-200">
                ฝ่ายโครงการ
              </span>
            </div>

            <div className="space-y-0.5 pt-0.5">
              {/* 1. BOQ Management */}
              <button
                onClick={() => handleSelect('boq')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'boq'
                    ? 'bg-[#005aa9] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'boq' ? 'text-white' : 'text-[#005aa9]'}`} />
                  <span className="truncate">BOQ โครงการ</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  currentTab === 'boq'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-900'
                }`}>
                  3 ชั้น
                </span>
              </button>

              {/* 2. Subcontractors & Inspections */}
              <button
                onClick={() => handleSelect('subcontracts')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'subcontracts'
                    ? 'bg-[#005aa9] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <HardHat className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'subcontracts' ? 'text-white' : 'text-[#005aa9]'}`} />
                  <span className="truncate">บริหารผู้รับเหมาช่วง</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  currentTab === 'subcontracts'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-900'
                }`}>
                  ช่างเหมา
                </span>
              </button>

              {/* 3. Project Budget & Profit */}
              <button
                onClick={() => handleSelect('projects')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'projects'
                    ? 'bg-[#005aa9] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderKanban className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'projects' ? 'text-white' : 'text-[#005aa9]'}`} />
                  <span className="truncate">ต้นทุน & กำไรโครงการ</span>
                </div>
              </button>
            </div>
          </div>

          {/* ZONE 2.5: ฝ่ายจัดซื้อ & บัญชีเจ้าหนี้ (Procurement & Payables) */}
          <div className="space-y-1 pt-1 border-t border-slate-200">
            <div className="px-1.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-indigo-700 shrink-0" />
                ฝ่ายจัดซื้อ & เจ้าหนี้
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded border font-bold bg-indigo-50 text-indigo-900 border-indigo-200">
                Express Bridge
              </span>
            </div>

            <div className="space-y-0.5 pt-0.5">
              {/* 1. Procurement & Material Backcharge */}
              <button
                onClick={() => handleSelect('procurement')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'procurement'
                    ? 'bg-indigo-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShoppingBag className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'procurement' ? 'text-white' : 'text-indigo-700'}`} />
                  <span className="truncate">ตรวจรับพัสดุ & ตัดหักสัญญา</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  currentTab === 'procurement'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 text-indigo-900'
                }`}>
                  GR / Backcharge
                </span>
              </button>

              {/* 2. Supplier Billing Desk */}
              <button
                onClick={() => handleSelect('supplier_billing')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'supplier_billing'
                    ? 'bg-emerald-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ReceiptText className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'supplier_billing' ? 'text-white' : 'text-[#009540]'}`} />
                  <span className="truncate">รับวางบิลร้านค้า</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  currentTab === 'supplier_billing'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-900'
                }`}>
                  Express PO
                </span>
              </button>
            </div>
          </div>

          {/* ZONE 3: ฝ่ายการเงิน & ธนาคาร (Finance & Treasury) */}
          <div className="space-y-1 pt-1 border-t border-slate-200">
            <div className="px-1.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                <WalletCards className="w-3 h-3 text-[#009540] shrink-0" />
                ฝ่ายการเงิน & ธนาคาร
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded border font-bold bg-emerald-50 text-[#009540] border-emerald-200">
                ฝ่ายการเงิน
              </span>
            </div>

            <div className="space-y-0.5 pt-0.5">
              {/* 1. DBM List */}
              <button
                onClick={() => handleSelect('disbursements')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'disbursements'
                    ? 'bg-[#009540] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'disbursements' ? 'text-white' : 'text-[#009540]'}`} />
                  <span className="truncate">ใบขอตั้งเบิก (DBM)</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border shrink-0 ${
                  currentTab === 'disbursements' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {disbursementsCount}
                </span>
              </button>

              {/* 2. Payment & PV */}
              <button
                onClick={() => handleSelect('payment')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'payment'
                    ? 'bg-[#009540] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CreditCard className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'payment' ? 'text-white' : 'text-[#009540]'}`} />
                  <span className="truncate">บันทึกจ่ายเงิน & PV</span>
                </div>
                {pendingDisbursementsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border shrink-0 ${
                    currentTab === 'payment' 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {pendingDisbursementsCount} รอจ่าย
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ZONE 4: ฝ่ายบัญชี & ภาษี (Accounting & Tax) */}
          <div className="space-y-1 pt-1 border-t border-slate-200">
            <div className="px-1.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                <ReceiptText className="w-3 h-3 text-slate-700 shrink-0" />
                ฝ่ายบัญชี & ภาษี
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded border font-bold bg-slate-100 text-slate-700 border-slate-300">
                ฝ่ายบัญชี
              </span>
            </div>

            <div className="space-y-0.5 pt-0.5">
              {/* 1. Transactions GL */}
              <button
                onClick={() => handleSelect('transactions')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'transactions'
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ReceiptText className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'transactions' ? 'text-white' : 'text-slate-600'}`} />
                  <span className="truncate">สมุดรายรับ-รายจ่าย (GL)</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border shrink-0 ${
                  currentTab === 'transactions' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  {totalTransactionsCount}
                </span>
              </button>

              {/* 2. Tax & Social Security */}
              <button
                onClick={() => handleSelect('tax_summary')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'tax_summary'
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck2 className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'tax_summary' ? 'text-white' : 'text-slate-600'}`} />
                  <span className="truncate">สรุปภาษี & ประกันสังคม</span>
                </div>
              </button>

              {/* 3. Bank Accounts & Intercompany Loans */}
              <button
                onClick={() => handleSelect('accounts')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'accounts'
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <WalletCards className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'accounts' ? 'text-white' : 'text-slate-600'}`} />
                  <span className="truncate">บัญชีธนาคาร & เงินยืม</span>
                </div>
              </button>

              {/* 4. Planning & Due Dates */}
              <button
                onClick={() => handleSelect('todoist')}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'todoist'
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${currentTab === 'todoist' ? 'text-white' : 'text-slate-600'}`} />
                  <span className="truncate">กำหนดจ่าย & ภาระผูกพัน</span>
                </div>
                {pendingTasksCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border shrink-0 ${
                    currentTab === 'todoist' 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    {pendingTasksCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 4: เครื่องมือ & จัดการข้อมูล */}
          <div className="space-y-0.5 pt-2 border-t border-slate-200">
            <div className="px-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              เครื่องมือ & ข้อมูล
            </div>

            <button
              onClick={() => {
                onImportCSVClick();
                onCloseMobile();
              }}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>นำเข้าไฟล์ CSV</span>
            </button>

            <button
              onClick={() => {
                onExportCSV();
                onCloseMobile();
              }}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>ส่งออก CSV</span>
            </button>

            {onOpenSupabaseSettings && (
              <button
                onClick={() => {
                  onOpenSupabaseSettings();
                  onCloseMobile();
                }}
                className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer mt-1 border ${
                  isSupabaseConnected 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100' 
                    : 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className={`w-3.5 h-3.5 shrink-0 ${isSupabaseConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span>ตั้งค่าฐานข้อมูล Supabase</span>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Footer / Role & Balance Card */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50 space-y-1.5">
          <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
              <span className="font-semibold text-[#009540] flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                ยอดคงเหลือสุทธิ (GL)
              </span>
              {userRole === 'staff' && (
                <span className="text-[9px] text-slate-400 font-bold">ซ่อนยอด</span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">
              {userRole === 'executive' ? formattedBalance : '฿ ••••••••'}
            </p>
          </div>

          {/* Role Switcher Pill */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                userRole === 'executive'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {userRole === 'executive' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>👑 สิทธิ์ผู้บริหาร</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>👤 สิทธิ์เจ้าหน้าที่ (ล็อก)</span>
                  </>
                )}
              </div>
              <span className="text-[10px] underline">
                {userRole === 'executive' ? 'สลับ' : 'ปลดล็อก'}
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
