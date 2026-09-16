import { 
  Menu, 
  Search, 
  Sparkles, 
  Download, 
  Upload, 
  ReceiptText, 
  Database, 
  Lock, 
  ShieldCheck
} from 'lucide-react';
import { ViewTab, UserRole } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  onOpenMobileMenu: () => void;
  onOpenAI: () => void;
  onExportCSV: () => void;
  onImportCSVClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalTransactionsCount: number;
  isSupabaseConnected?: boolean;
  onOpenSupabaseStatus?: () => void;
  userRole?: UserRole;
  onOpenAuthModal?: () => void;
}

export type DepartmentZone = 'executive' | 'project' | 'finance' | 'accounting';

interface TabMeta {
  department: DepartmentZone;
  departmentName: string;
  badgeColor: string;
  title: string;
  subtitle: string;
}

const TAB_METADATA: Record<ViewTab, TabMeta> = {
  // ฝ่ายบริหารองค์กร (Executive)
  dashboard: {
    department: 'executive',
    departmentName: 'ฝ่ายบริหารองค์กร',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    title: 'แดชบอร์ดภาพรวมผู้บริหาร',
    subtitle: 'สรุปภาพรวมสภาพคล่อง, ผลประกอบการ 4 บริษัทในเครือ และสถานะกระแสเงินสด'
  },
  reports: {
    department: 'executive',
    departmentName: 'ฝ่ายบริหารองค์กร',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    title: 'รายงานการเงิน & งบกำไรขาดทุน (P&L)',
    subtitle: 'งบกำไรขาดทุนสะสม, วิเคราะห์รายรับ-รายจ่ายรายเดือน และสถานะสภาพคล่อง'
  },
  ai_analysis: {
    department: 'executive',
    departmentName: 'ฝ่ายบริหารองค์กร',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    title: 'AI วิเคราะห์งบการเงิน & สภาพคล่อง',
    subtitle: 'ประเมินกระแสเงินสดจากการดำเนินงาน, เฝ้าระวังความเสี่ยงโครงการ และ Cash Runway'
  },

  // ฝ่ายโครงการก่อสร้าง (Project)
  boq: {
    department: 'project',
    departmentName: 'ฝ่ายโครงการก่อสร้าง',
    badgeColor: 'bg-blue-50 text-[#005aa9] border-blue-200',
    title: 'BOQ โครงการ',
    subtitle: 'บริหาร BOQ 3 ชั้น: สัญญาประมูล, งบวิศวะหน้างาน และโควตาถอดแบบวัสดุ (BOM) รายโครงการ'
  },
  subcontracts: {
    department: 'project',
    departmentName: 'ฝ่ายโครงการก่อสร้าง',
    badgeColor: 'bg-blue-50 text-[#005aa9] border-blue-200',
    title: 'บริหารผู้รับเหมาช่วง & ตรวจรับงาน',
    subtitle: 'สัญญาจ้างช่างเหมา, ตรวจรับงานตาม กม., หักค่าวัสดุร้านค้า/ค่าปรับ, เบิกค่าผลงาน และคืนเงินประกัน'
  },
  projects: {
    department: 'project',
    departmentName: 'ฝ่ายโครงการก่อสร้าง',
    badgeColor: 'bg-blue-50 text-[#005aa9] border-blue-200',
    title: 'ต้นทุน & กำไรโครงการ',
    subtitle: 'ภาพรวมกำไรขั้นต้น, สรุปรายรับ-รายจ่ายจริงเทียบโครงการ และแยกตามหมวดต้นทุน'
  },

  // ฝ่ายการเงิน & ธนาคาร (Finance)
  disbursements: {
    department: 'finance',
    departmentName: 'ฝ่ายการเงิน & ธนาคาร',
    badgeColor: 'bg-emerald-50 text-[#009540] border-emerald-200',
    title: 'ใบขอตั้งเบิก (DBM)',
    subtitle: 'จัดทำใบขอตั้งเบิกเงินค่าใช้จ่าย, แนบเอกสารหลักฐาน และเสนอผู้บริหารพิจารณาอนุมัติจ่าย'
  },
  payment: {
    department: 'finance',
    departmentName: 'ฝ่ายการเงิน & ธนาคาร',
    badgeColor: 'bg-emerald-50 text-[#009540] border-emerald-200',
    title: 'บันทึกจ่ายเงิน & ใบสำคัญจ่าย (PV)',
    subtitle: 'คิวจ่ายเงินที่ได้รับอนุมัติแล้ว, บันทึกการโอนเงิน, แนบสลิป และพิมพ์ PV'
  },

  // ฝ่ายบัญชี & ภาษี (Accounting)
  transactions: {
    department: 'accounting',
    departmentName: 'ฝ่ายบัญชี & ภาษี',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    title: 'สมุดรายรับ-รายจ่าย (GL)',
    subtitle: 'สมุดรายวันทั่วไป, บัญชีแยกประเภท, บันทึกเดบิต/เครดิต และกระทบยอดสเตทเมนต์'
  },
  tax_summary: {
    department: 'accounting',
    departmentName: 'ฝ่ายบัญชี & ภาษี',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    title: 'สรุปภาษี & ประกันสังคม',
    subtitle: 'ภ.ง.ด. 1, 3, 53, ภาษีมูลค่าเพิ่ม (ภ.พ.30) และเงินสมทบ สปส.'
  },
  accounts: {
    department: 'accounting',
    departmentName: 'ฝ่ายบัญชี & ภาษี',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    title: 'บัญชีธนาคาร & เงินยืมในเครือ',
    subtitle: 'ยอดเงินฝากทุกบัญชีธนาคาร (KTB, BBL), บัญชีเงินสดย่อย และเงินกู้ยืมระหว่างบริษัท'
  },
  todoist: {
    department: 'accounting',
    departmentName: 'ฝ่ายบัญชี & ภาษี',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    title: 'ปฏิทินกำหนดจ่าย & ภาระผูกพัน',
    subtitle: 'กำหนดการยื่นภาษี, ส่งมอบงานงวด, ชำระหนี้คู่ค้า และรายการภาระงาน'
  },

  // งานตรวจรับพัสดุ & ตัดหักสัญญา (เชื่อมโยงฝ่ายโครงการก่อสร้าง)
  procurement: {
    department: 'project',
    departmentName: 'ฝ่ายโครงการก่อสร้าง',
    badgeColor: 'bg-blue-50 text-[#005aa9] border-blue-200',
    title: 'ตรวจรับพัสดุ & ตัดหักสัญญา (Goods Receipts & Allocation)',
    subtitle: 'ตรวจรับวัสดุหน้างานตามใบส่งของ DO, จัดสรรต้นทุนเข้าโครงการ/สต๊อกสโตร์, หักเงินสัญญาช่างเหมา และเทียบราคา 3 เจ้า'
  },
  // งานรับวางบิลร้านค้า (เชื่อมโยงฝ่ายการเงิน & ธนาคาร)
  supplier_billing: {
    department: 'finance',
    departmentName: 'ฝ่ายการเงิน & ธนาคาร',
    badgeColor: 'bg-emerald-50 text-[#009540] border-emerald-200',
    title: 'รับวางบิลร้านค้า & เช็คเอกสาร 3-Way Match',
    subtitle: 'รับวางบิลผู้ค้า, ตรวจใบกำกับภาษี-ใบส่งของมีลายเซ็นต์-สลิปชั่ง, ตรวจสอบตัดหักช่าง และส่งฝ่ายบัญชีออก PV'
  }
};

export function Header({
  currentTab,
  onOpenMobileMenu,
  onOpenAI,
  onExportCSV,
  onImportCSVClick,
  searchQuery,
  onSearchChange,
  isSupabaseConnected = false,
  onOpenSupabaseStatus,
  userRole = 'executive',
  onOpenAuthModal,
}: HeaderProps) {
  const currentMeta = TAB_METADATA[currentTab] || {
    department: 'accounting',
    departmentName: 'ฝ่ายบัญชี & ภาษี',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    title: 'ระบบบัญชี & เบิกจ่าย',
    subtitle: 'บจก. บุรีรัมย์ธงชัยก่อสร้าง'
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs h-14 flex items-center shrink-0">
      <div className="w-full px-3 sm:px-4 lg:px-5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Menu Toggle & Department / Page Heading */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
              aria-label="เปิดเมนู"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {currentMeta.title}
                </h1>
                
                {/* Visual Department Badge */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 hidden sm:inline-flex items-center gap-1 border ${currentMeta.badgeColor}`}>
                  {currentMeta.departmentName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden md:block">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Search, AI & Clearly Separated Action Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Search Input */}
            <div className="relative hidden sm:block w-36 md:w-44 lg:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ค้นหา..."
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005aa9] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Tools & Utilities Group */}
            <div className="flex items-center gap-1">
              {/* Supabase Status Icon Button */}
              {onOpenSupabaseStatus && (
                <button
                  type="button"
                  onClick={onOpenSupabaseStatus}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSupabaseConnected 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                  title={isSupabaseConnected ? 'สถานะ Supabase: เชื่อมต่อสำเร็จ' : 'เชื่อมต่อฐานข้อมูล Supabase'}
                >
                  <Database className="w-4 h-4" />
                </button>
              )}

              {/* AI Assistant Icon Button */}
              <button
                type="button"
                onClick={onOpenAI}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  currentTab === 'ai_analysis'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-amber-600 border-slate-200'
                }`}
                title="AI ผู้ช่วยวิเคราะห์งบการเงิน"
              >
                <Sparkles className={`w-4 h-4 ${currentTab === 'ai_analysis' ? 'text-white' : 'text-amber-600'}`} />
              </button>

              {/* Quick Export/Import */}
              <button
                type="button"
                onClick={onImportCSVClick}
                className="hidden md:inline-flex p-1.5 rounded-lg text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="นำเข้าไฟล์ CSV"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExportCSV}
                className="hidden md:inline-flex p-1.5 rounded-lg text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="ส่งออก CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Role Access Pill */}
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                  userRole === 'executive'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title={userRole === 'executive' ? 'สิทธิ์ผู้บริหาร (คลิกเพื่อสลับโหมด)' : 'สิทธิ์พนักงาน (คลิกเพื่อปลดล็อกผู้บริหาร)'}
              >
                {userRole === 'executive' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">👑 ผู้บริหาร</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">🔒 ปลดล็อกผู้บริหาร</span>
                  </>
                )}
              </button>
            )}



          </div>
        </div>
      </div>
    </header>
  );
}
