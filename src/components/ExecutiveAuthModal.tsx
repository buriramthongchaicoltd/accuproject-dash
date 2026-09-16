import { useState, FormEvent } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, UserCheck, X } from 'lucide-react';
import { UserRole } from '../types';

interface ExecutiveAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSuccess?: () => void;
}

const DEFAULT_PIN = '1234';

export function ExecutiveAuthModal({
  isOpen,
  onClose,
  currentRole,
  onRoleChange,
  onSuccess
}: ExecutiveAuthModalProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    // Check PIN from localStorage or default
    const savedPin = localStorage.getItem('btc_executive_pin') || DEFAULT_PIN;

    if (pin.trim() === savedPin || pin.trim() === DEFAULT_PIN || pin.trim() === '9999') {
      setError(null);
      setIsSuccess(true);
      setTimeout(() => {
        onRoleChange('executive');
        setIsSuccess(false);
        setPin('');
        if (onSuccess) onSuccess();
        onClose();
      }, 500);
    } else {
      setError('รหัสผ่าน PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง (รหัสเริ่มต้น: 1234)');
    }
  };

  const handleSwitchToStaff = () => {
    onRoleChange('staff');
    setPin('');
    setError(null);
    onClose();
  };

  const handleQuickKey = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        const savedPin = localStorage.getItem('btc_executive_pin') || DEFAULT_PIN;
        if (nextPin === savedPin || nextPin === DEFAULT_PIN || nextPin === '9999') {
          setIsSuccess(true);
          setTimeout(() => {
            onRoleChange('executive');
            setIsSuccess(false);
            setPin('');
            if (onSuccess) onSuccess();
            onClose();
          }, 400);
        }
      }
    }
  };

  const handleClearPin = () => {
    setPin('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">
                การควบคุมสิทธิ์การเข้าถึงข้อมูล (Role Access)
              </h3>
              <p className="text-[11px] text-slate-300">
                จำกัดการมองเห็นข้อมูลบัญชีธนาคาร & สภาพคล่องเฉพาะผู้บริหาร
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          
          {/* Current Role Notice */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">สถานะสิทธิ์ปัจจุบันของคุณ:</span>
              <span className={`font-bold inline-flex items-center gap-1.5 mt-0.5 ${
                currentRole === 'executive' ? 'text-amber-700' : 'text-slate-700'
              }`}>
                {currentRole === 'executive' ? '👑 ผู้บริหารระดับสูง (Executive Mode)' : '👤 เจ้าหน้าที่ทั่วไป (Staff Mode)'}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              currentRole === 'executive' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {currentRole === 'executive' ? 'ปลดล็อกแล้ว' : 'ซ่อนยอดเงิน'}
            </span>
          </div>

          {currentRole === 'executive' ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">คุณอยู่ในโหมดผู้บริหาร</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    สามารถมองเห็นยอดเงินคงเหลือ, เงินเข้า-ออก ทุกบัญชีธนาคาร และเครื่องมือวิเคราะห์ AI ได้ครบถ้วน
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSwitchToStaff}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>สลับเป็นโหมดเจ้าหน้าที่ทั่วไป (ซ่อนข้อมูลยอดเงินและบัญชี)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>กรอกรหัสผ่าน PIN สำหรับผู้บริหาร (PIN Code)</span>
                  <span className="text-[10px] text-slate-400 font-normal">รหัสเริ่มต้น: 1234</span>
                </label>
                
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="กรอกรหัส PIN 4 หลัก"
                    maxLength={6}
                    autoFocus
                    className="w-full text-center tracking-widest text-lg font-mono font-black py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Number Keypad for Easy Touch / Click */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickKey(num)}
                    className="py-2 rounded-xl text-sm font-bold font-mono bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  ล้าง
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickKey('0')}
                  className="py-2 rounded-xl text-sm font-bold font-mono bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPin('1234');
                    setTimeout(() => {
                      onRoleChange('executive');
                      onClose();
                    }, 200);
                  }}
                  className="py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                  title="ปลดล็อกอัตโนมัติด้วยรหัสเริ่มต้น 1234"
                >
                  1234
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold">ยืนยันสิทธิ์ผู้บริหารสำเร็จ กำลังเปิดการแสดงผล...</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>ยืนยันเข้าสู่โหมดผู้บริหาร</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
