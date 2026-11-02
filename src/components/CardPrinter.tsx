import { useState, useRef } from 'react';
import { getStudents, getTeachers, getSettings } from '../store';
import { Student, Teacher } from '../types';
import { Printer, CreditCard, Users, GraduationCap, Search, CheckSquare, Square, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type PrintType = 'student' | 'teacher';

export default function CardPrinter() {
  const [printType, setPrintType] = useState<PrintType>('student');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [previewItem, setPreviewItem] = useState<(Student | Teacher) | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const settings = getSettings();
  const students = getStudents();
  const teachers = getTeachers();

  const currentList = printType === 'student' ? students : teachers;
  
  const filteredList = currentList.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (printType === 'student') {
      const student = item as Student;
      return student.name.toLowerCase().includes(searchLower) || 
             student.nis.toLowerCase().includes(searchLower) ||
             student.className.toLowerCase().includes(searchLower);
    } else {
      const teacher = item as Teacher;
      return teacher.name.toLowerCase().includes(searchLower) || 
             teacher.nip.toLowerCase().includes(searchLower) ||
             teacher.subject.toLowerCase().includes(searchLower);
    }
  });

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map(item => item.id)));
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Kartu Absensi - ${settings.schoolName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              background: #f8fafc;
            }
            .card { 
              width: 380px; 
              height: 240px; 
              border-radius: 20px; 
              margin: 15px; 
              display: inline-block;
              page-break-inside: avoid;
              position: relative;
              overflow: hidden;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            }
            .card::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: shimmer 3s infinite;
            }
            @keyframes shimmer {
              0%, 100% { transform: translate(0, 0); }
              50% { transform: translate(-10%, -10%); }
            }
            .card-content {
              position: relative;
              z-index: 1;
              padding: 20px;
              height: 100%;
              display: flex;
              flex-direction: column;
              color: white;
            }
            .card-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 15px;
            }
            .school-icon {
              width: 45px;
              height: 45px;
              background: rgba(255,255,255,0.2);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255,255,255,0.3);
            }
            .school-info {
              flex: 1;
            }
            .school-name {
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0.5px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
              line-height: 1.2;
            }
            .card-type {
              font-size: 10px;
              opacity: 0.9;
              font-weight: 500;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .card-body {
              flex: 1;
              display: flex;
              gap: 15px;
              align-items: center;
            }
            .info-section {
              flex: 1;
            }
            .name {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 10px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
              line-height: 1.2;
            }
            .detail-grid {
              display: grid;
              gap: 6px;
            }
            .detail-row {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 11px;
            }
            .detail-icon {
              width: 20px;
              height: 20px;
              background: rgba(255,255,255,0.2);
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              flex-shrink: 0;
            }
            .detail-text {
              font-weight: 500;
              opacity: 0.95;
            }
            .qr-section {
              background: white;
              border-radius: 12px;
              padding: 10px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
            }
            .qr-section svg {
              width: 80px;
              height: 80px;
            }
            .qr-code-text {
              font-size: 9px;
              font-weight: 700;
              color: #667eea;
              font-family: 'Courier New', monospace;
              letter-spacing: 0.5px;
            }
            .card-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: auto;
              padding-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.2);
              font-size: 9px;
              opacity: 0.8;
            }
            .decoration-dots {
              position: absolute;
              bottom: 10px;
              right: 10px;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 3px;
              opacity: 0.3;
            }
            .dot {
              width: 4px;
              height: 4px;
              background: white;
              border-radius: 50%;
            }
            @media print {
              body { padding: 0; background: white; }
              .card { margin: 10px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const renderCard = (item: Student | Teacher, showPreview = false) => {
    const isStudent = printType === 'student';
    const code = isStudent ? (item as Student).nis : (item as Teacher).nip;
    const name = item.name;
    const detail1 = isStudent ? (item as Student).className : (item as Teacher).subject;
    const detail2 = isStudent ? (item as Student).gender : (item as Teacher).position;
    const codeLabel = isStudent ? 'NIS' : 'NIP';

    return (
      <div 
        key={item.id}
        className={`bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[20px] ${
          showPreview ? 'w-[380px] h-[240px]' : 'w-full'
        } relative overflow-hidden shadow-2xl`}
        style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 h-full flex flex-col text-white">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl border-2 border-white/30">
              {isStudent ? '🎓' : '👨‍🏫'}
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold tracking-wide leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {settings.schoolName}
              </div>
              <div className="text-[10px] opacity-90 font-medium tracking-widest uppercase mt-0.5">
                KARTU {isStudent ? 'SISWA' : 'GURU'}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex gap-4 items-center flex-1">
            {/* Info Section */}
            <div className="flex-1">
              <div className="text-lg font-bold mb-2.5 leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {name}
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center text-[10px] flex-shrink-0">
                    {isStudent ? '📚' : '📖'}
                  </div>
                  <span className="font-medium opacity-95">
                    {isStudent ? 'Kelas' : 'Mapel'}: {detail1}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center text-[10px] flex-shrink-0">
                    {isStudent ? '⚧' : '💼'}
                  </div>
                  <span className="font-medium opacity-95">
                    {isStudent ? 'Gender' : 'Jabatan'}: {detail2}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white rounded-xl p-2.5 shadow-lg flex flex-col items-center gap-1">
              <QRCodeSVG
                value={code}
                size={80}
                level="M"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#667eea"
              />
              <div className="text-[9px] font-bold text-indigo-600 font-mono tracking-wide">
                {code}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-auto pt-2.5 border-t border-white/20 text-[9px] opacity-80">
            <span>{codeLabel}: {code}</span>
            <span>Tahun Ajaran 2024/2025</span>
          </div>
        </div>

        {/* Decoration Dots */}
        <div className="absolute bottom-2.5 right-2.5 grid grid-cols-3 gap-1 opacity-30">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    );
  };

  const selectedItems = currentList.filter(item => selectedIds.has(item.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <CreditCard className="text-indigo-400" />
          Cetak Kartu Absensi
        </h1>
        <p className="text-gray-400 mt-1">Cetak kartu QR Code untuk siswa dan guru</p>
      </div>

      {/* Type Selector */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex gap-3">
          <button
            onClick={() => { setPrintType('student'); setSelectedIds(new Set()); }}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              printType === 'student' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Users size={20} />
            Kartu Siswa
          </button>
          <button
            onClick={() => { setPrintType('teacher'); setSelectedIds(new Set()); }}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              printType === 'teacher' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <GraduationCap size={20} />
            Kartu Guru
          </button>
        </div>
      </div>

      {/* Search & Select */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Cari ${printType === 'student' ? 'siswa' : 'guru'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            onClick={selectAll}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            {selectedIds.size === filteredList.length ? <CheckSquare size={18} /> : <Square size={18} />}
            {selectedIds.size === filteredList.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
          </button>
          <button
            onClick={handlePrint}
            disabled={selectedIds.size === 0}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <Printer size={18} />
            Cetak ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400 w-12">
                  <button onClick={selectAll}>
                    {selectedIds.size === filteredList.length ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                  {printType === 'student' ? 'NIS' : 'NIP'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Nama</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                  {printType === 'student' ? 'Kelas' : 'Mapel'}
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(item.id)}>
                        {selectedIds.has(item.id) ? (
                          <CheckSquare size={18} className="text-emerald-400" />
                        ) : (
                          <Square size={18} className="text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-400 font-mono">
                      {printType === 'student' ? (item as Student).nis : (item as Teacher).nip}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {printType === 'student' ? (item as Student).className : (item as Teacher).subject}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Preview Kartu</h3>
              <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              {renderCard(previewItem, true)}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setSelectedIds(new Set([previewItem.id]));
                  setPreviewItem(null);
                  setTimeout(handlePrint, 100);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Printer size={18} />
                Cetak Kartu Ini
              </button>
              <button
                onClick={() => setPreviewItem(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl font-semibold transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Area */}
      <div className="hidden">
        <div ref={printRef} className="flex flex-wrap gap-4">
          {selectedItems.map(item => renderCard(item))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
          <QrCode size={18} />
          💡 Tips Cetak Kartu
        </h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Gunakan kertas tebal (250-300 gsm) untuk hasil terbaik</li>
          <li>• Ukuran kartu: 9.5cm x 6cm (ukuran kartu kredit)</li>
          <li>• QR Code dapat di-scan dengan scanner CASHCOW HC-P10 atau HP</li>
          <li>• Setelah dicetak, laminating agar lebih awet</li>
          <li>• Design modern dengan gradient dan QR Code 2D</li>
        </ul>
      </div>
    </div>
  );
}
