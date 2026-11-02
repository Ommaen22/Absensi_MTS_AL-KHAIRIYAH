import { useState, useRef } from 'react';
import { getStudents, getTeachers, getSettings } from '../store';
import { Student, Teacher } from '../types';
import { Printer, CreditCard, Users, GraduationCap, Search, CheckSquare, Square, Download } from 'lucide-react';
import Barcode from 'react-barcode';

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

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Kartu Absensi - ${settings.schoolName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .card { 
              width: 340px; 
              height: 215px; 
              border: 2px solid #10b981; 
              border-radius: 12px; 
              padding: 15px; 
              margin: 10px; 
              display: inline-block;
              page-break-inside: avoid;
              background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
            }
            .card-header {
              text-align: center;
              border-bottom: 2px solid #10b981;
              padding-bottom: 8px;
              margin-bottom: 10px;
            }
            .school-name {
              font-size: 11px;
              font-weight: bold;
              color: #065f46;
              margin-bottom: 2px;
            }
            .card-title {
              font-size: 10px;
              color: #047857;
              font-weight: 600;
            }
            .card-body {
              display: flex;
              gap: 12px;
              align-items: center;
            }
            .photo-box {
              width: 70px;
              height: 85px;
              border: 2px solid #10b981;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f0fdf4;
              flex-shrink: 0;
            }
            .photo-placeholder {
              font-size: 32px;
            }
            .info-section {
              flex: 1;
            }
            .name {
              font-size: 13px;
              font-weight: bold;
              color: #065f46;
              margin-bottom: 6px;
              line-height: 1.2;
            }
            .detail-row {
              font-size: 10px;
              margin-bottom: 3px;
              color: #047857;
            }
            .detail-label {
              font-weight: 600;
              display: inline-block;
              width: 50px;
            }
            .barcode-section {
              text-align: center;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px dashed #10b981;
            }
            .barcode-section svg {
              max-width: 100%;
              height: 45px;
            }
            .barcode-text {
              font-size: 9px;
              font-family: monospace;
              color: #065f46;
              margin-top: 2px;
              font-weight: 600;
            }
            @media print {
              body { padding: 0; }
              .card { margin: 5px; }
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
        className={`bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-500 rounded-xl p-4 ${
          showPreview ? 'w-[340px] h-[215px]' : 'w-full'
        }`}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-emerald-500 pb-2 mb-3">
          <div className="text-xs font-bold text-emerald-900">{settings.schoolName}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">KARTU ABSENSI {isStudent ? 'SISWA' : 'GURU'}</div>
        </div>

        {/* Body */}
        <div className="flex gap-3 items-center">
          {/* Photo Box */}
          <div className="w-[70px] h-[85px] border-2 border-emerald-500 rounded-lg flex items-center justify-center bg-emerald-50 flex-shrink-0">
            <div className="text-3xl">
              {isStudent ? '👤' : '🎓'}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="text-sm font-bold text-emerald-900 mb-1.5 leading-tight">{name}</div>
            <div className="text-[10px] mb-1 text-emerald-800">
              <span className="font-semibold inline-block w-[50px]">{codeLabel}:</span>
              {code}
            </div>
            <div className="text-[10px] mb-1 text-emerald-800">
              <span className="font-semibold inline-block w-[50px]">
                {isStudent ? 'Kelas' : 'Mapel'}:
              </span>
              {detail1}
            </div>
            <div className="text-[10px] text-emerald-800">
              <span className="font-semibold inline-block w-[50px]">
                {isStudent ? 'Gender' : 'Jabatan'}:
              </span>
              {detail2}
            </div>
          </div>
        </div>

        {/* Barcode */}
        <div className="text-center mt-2 pt-2 border-t border-dashed border-emerald-500">
          <Barcode 
            value={code} 
            format="CODE128"
            height={40}
            width={1.5}
            displayValue={false}
            background="transparent"
            lineColor="#065f46"
          />
          <div className="text-[9px] font-mono text-emerald-900 mt-1 font-semibold">{code}</div>
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
        <p className="text-gray-400 mt-1">Cetak kartu barcode untuk siswa dan guru</p>
      </div>

      {/* Type Selector */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex gap-3">
          <button
            onClick={() => { setPrintType('student'); setSelectedIds(new Set()); }}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              printType === 'student' 
                ? 'bg-emerald-500 text-white' 
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
                ? 'bg-purple-500 text-white' 
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
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
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
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
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
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="text-blue-400 font-semibold mb-2">💡 Tips Cetak Kartu</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Gunakan kertas tebal (200-300 gsm) untuk hasil terbaik</li>
          <li>• Ukuran kartu: 8.5cm x 5.4cm (ukuran kartu kredit)</li>
          <li>• Pastikan printer设置为 "Actual Size" atau "100%"</li>
          <li>• Setelah dicetak, bisa dilaminating agar lebih awet</li>
          <li>• Barcode dapat di-scan dengan scanner CASHCOW HC-P10</li>
        </ul>
      </div>
    </div>
  );
}
