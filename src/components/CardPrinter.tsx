import { useState, useRef, useEffect } from 'react';
import { getStudents, getTeachers, getSettings } from '../store';
import { Student, Teacher } from '../types';
import { Printer, CreditCard, Users, GraduationCap, Search, CheckSquare, Square, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';

type PrintType = 'student' | 'teacher';

export default function CardPrinter() {
  const [printType, setPrintType] = useState<PrintType>('student');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [previewItem, setPreviewItem] = useState<(Student | Teacher) | null>(null);
  const [qrDataUrls, setQrDataUrls] = useState<Map<string, string>>(new Map());
  const printRef = useRef<HTMLDivElement>(null);

  const settings = getSettings();
  const students = getStudents();
  const teachers = getTeachers();

  const currentList = printType === 'student' ? students : teachers;
  
  // Pre-generate QR codes for all items
  useEffect(() => {
    const generateQRCodes = async () => {
      const newMap = new Map<string, string>();
      const allItems = [...students, ...teachers];
      
      for (const item of allItems) {
        const code = printType === 'student' 
          ? (item as Student).nis 
          : (item as Teacher).nip;
        
        if (!qrDataUrls.has(code)) {
          try {
            const dataUrl = await QRCode.toDataURL(code, {
              width: 200,
              margin: 1,
              color: {
                dark: '#4f46e5',
                light: '#ffffff'
              },
              errorCorrectionLevel: 'M'
            });
            newMap.set(code, dataUrl);
          } catch (err) {
            console.error('QR generation error:', err);
          }
        }
      }
      
      if (newMap.size > 0) {
        setQrDataUrls(new Map([...qrDataUrls, ...newMap]));
      }
    };

    generateQRCodes();
  }, [students, teachers, printType]);

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

  const generateCardHTML = (item: Student | Teacher): string => {
    const isStudent = printType === 'student';
    const code = isStudent ? (item as Student).nis : (item as Teacher).nip;
    const name = item.name;
    const detail1 = isStudent ? (item as Student).className : (item as Teacher).subject;
    const detail2 = isStudent ? ((item as Student).gender === 'L' ? 'Laki-laki' : 'Perempuan') : (item as Teacher).position;
    const codeLabel = isStudent ? 'NIS' : 'NIP';
    const detail1Label = isStudent ? 'Kelas' : 'Mata Pelajaran';
    const detail2Label = isStudent ? 'Gender' : 'Jabatan';
    const emoji = isStudent ? '🎓' : '👨‍🏫';
    
    const qrDataUrl = qrDataUrls.get(code) || '';

    return `
      <div class="card">
        <div class="card-bg-decoration"></div>
        <div class="card-content">
          <div class="card-header">
            <div class="school-icon">${emoji}</div>
            <div class="school-info">
              <div class="school-name">${settings.schoolName}</div>
              <div class="card-type">KARTU ${isStudent ? 'SISWA' : 'GURU'}</div>
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-section">
              <div class="name">${name}</div>
              <div class="detail-grid">
                <div class="detail-row">
                  <div class="detail-icon">${isStudent ? '📚' : '📖'}</div>
                  <span class="detail-text">${detail1Label}: ${detail1}</span>
                </div>
                <div class="detail-row">
                  <div class="detail-icon">${isStudent ? '⚧' : '💼'}</div>
                  <span class="detail-text">${detail2Label}: ${detail2}</span>
                </div>
              </div>
            </div>
            
            <div class="qr-section">
              <img src="${qrDataUrl}" alt="QR Code" class="qr-image" />
              <div class="qr-code-text">${code}</div>
            </div>
          </div>
          
          <div class="card-footer">
            <span>${codeLabel}: ${code}</span>
            <span>Tahun Ajaran 2024/2025</span>
          </div>
        </div>
        
        <div class="decoration-dots">
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    const selectedItems = currentList.filter(item => selectedIds.has(item.id));
    if (selectedItems.length === 0) return;

    const cardsHTML = selectedItems.map(item => generateCardHTML(item)).join('');

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) {
      alert('Popup blocker aktif. Izinkan popup untuk mencetak.');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cetak Kartu Absensi - ${settings.schoolName}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f8fafc;
      padding: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .card {
      width: 340px;
      height: 215px;
      border-radius: 16px;
      margin: 8px;
      display: inline-block;
      vertical-align: top;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      -webkit-background-clip: padding-box;
      background-clip: padding-box;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .card-bg-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 100% 0%, rgba(255,255,255,0.15) 0%, transparent 50%),
        radial-gradient(circle at 0% 100%, rgba(255,255,255,0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .card-content {
      position: relative;
      z-index: 1;
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
      color: white;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    
    .school-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.3);
      flex-shrink: 0;
    }
    
    .school-info {
      flex: 1;
      min-width: 0;
    }
    
    .school-name {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .card-type {
      font-size: 9px;
      opacity: 0.9;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    
    .card-body {
      flex: 1;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .info-section {
      flex: 1;
      min-width: 0;
    }
    
    .name {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
      line-height: 1.2;
      word-wrap: break-word;
    }
    
    .detail-grid {
      display: grid;
      gap: 5px;
    }
    
    .detail-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
    }
    
    .detail-icon {
      width: 18px;
      height: 18px;
      background: rgba(255,255,255,0.2);
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      flex-shrink: 0;
    }
    
    .detail-text {
      font-weight: 500;
      opacity: 0.95;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .qr-section {
      background: white;
      border-radius: 10px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      flex-shrink: 0;
    }
    
    .qr-image {
      width: 70px;
      height: 70px;
      display: block;
    }
    
    .qr-code-text {
      font-size: 8px;
      font-weight: 700;
      color: #4f46e5;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.25);
      font-size: 8px;
      opacity: 0.85;
      font-weight: 500;
    }
    
    .decoration-dots {
      position: absolute;
      bottom: 8px;
      right: 8px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      opacity: 0.3;
    }
    
    .dot {
      width: 3px;
      height: 3px;
      background: white;
      border-radius: 50%;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .card {
        margin: 5px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${cardsHTML}
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const renderPreviewCard = (item: Student | Teacher) => {
    const isStudent = printType === 'student';
    const code = isStudent ? (item as Student).nis : (item as Teacher).nip;
    const name = item.name;
    const detail1 = isStudent ? (item as Student).className : (item as Teacher).subject;
    const detail2 = isStudent ? ((item as Student).gender === 'L' ? 'Laki-laki' : 'Perempuan') : (item as Teacher).position;
    const codeLabel = isStudent ? 'NIS' : 'NIP';
    const detail1Label = isStudent ? 'Kelas' : 'Mata Pelajaran';
    const detail2Label = isStudent ? 'Gender' : 'Jabatan';
    const emoji = isStudent ? '🎓' : '👨‍🏫';
    
    const qrDataUrl = qrDataUrls.get(code);

    return (
      <div 
        key={item.id}
        className="w-[340px] h-[215px] rounded-2xl relative overflow-hidden shadow-2xl"
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        {/* Decorative Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 100% 0%, rgba(255,255,255,0.15) 0%, transparent 50%),
              radial-gradient(circle at 0% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-4 h-full flex flex-col text-white">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl border-2 border-white/30 flex-shrink-0">
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold tracking-wide leading-tight truncate" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                {settings.schoolName}
              </div>
              <div className="text-[9px] opacity-90 font-semibold tracking-widest uppercase mt-0.5">
                KARTU {isStudent ? 'SISWA' : 'GURU'}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex gap-3 items-center flex-1">
            {/* Info Section */}
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold mb-2 leading-tight break-words" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                {name}
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-[18px] h-[18px] bg-white/20 rounded-md flex items-center justify-center text-[9px] flex-shrink-0">
                    {isStudent ? '📚' : '📖'}
                  </div>
                  <span className="font-medium opacity-95 truncate">
                    {detail1Label}: {detail1}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-[18px] h-[18px] bg-white/20 rounded-md flex items-center justify-center text-[9px] flex-shrink-0">
                    {isStudent ? '⚧' : '💼'}
                  </div>
                  <span className="font-medium opacity-95 truncate">
                    {detail2Label}: {detail2}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white rounded-xl p-2 shadow-lg flex flex-col items-center gap-1 flex-shrink-0">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-[70px] h-[70px]" />
              ) : (
                <QRCodeSVG
                  value={code}
                  size={70}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#4f46e5"
                />
              )}
              <div className="text-[8px] font-bold text-indigo-600 font-mono tracking-wide">
                {code}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/25 text-[8px] opacity-85 font-medium">
            <span>{codeLabel}: {code}</span>
            <span>Tahun Ajaran 2024/2025</span>
          </div>
        </div>

        {/* Decoration Dots */}
        <div className="absolute bottom-2 right-2 grid grid-cols-3 gap-0.5 opacity-30">
          <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
          <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
          <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
          <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
          <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
          <div className="w-[3px] h-[3px] bg-white rounded-full"></div>
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
              <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-white text-xl">
                ✕
              </button>
            </div>
            <div className="flex justify-center">
              {renderPreviewCard(previewItem)}
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

      {/* Info */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
          <QrCode size={18} />
          💡 Tips Cetak Kartu
        </h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Gunakan kertas tebal (250-300 gsm) untuk hasil terbaik</li>
          <li>• Ukuran kartu: 8.5cm x 5.4cm (ukuran kartu kredit)</li>
          <li>• QR Code dapat di-scan dengan scanner CASHCOW HC-P10 atau HP</li>
          <li>• Setelah dicetak, laminating agar lebih awet</li>
          <li>• Pastikan printer setting: <strong>Background graphics: ON</strong></li>
          <li>• Pilih kertas: <strong>Actual Size / 100%</strong></li>
        </ul>
      </div>
    </div>
  );
}
