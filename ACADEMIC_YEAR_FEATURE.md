# 📅 Fitur Tahun Ajaran di Kartu Absensi

## ✨ Fitur Baru

Kolom **Tahun Ajaran** telah ditambahkan di pengaturan sekolah dan terhubung langsung dengan kartu absensi siswa dan guru.

---

## 🎯 Cara Kerja

### 1. **Pengaturan Tahun Ajaran**
- Lokasi: **Menu Pengaturan → Informasi Sekolah → Tahun Ajaran**
- Format: `YYYY/YYYY` (contoh: `2025/2026`)
- Default: Otomatis sesuai tahun ajaran saat ini

### 2. **Auto-Detect Tahun Ajaran**
Sistem otomatis mendeteksi tahun ajaran berdasarkan bulan saat ini:
- **Juli - Desember**: Tahun ajaran `YYYY/YYYY+1`
- **Januari - Juni**: Tahun ajaran `YYYY-1/YYYY`

**Contoh:**
- Bulan September 2026 → Tahun ajaran: `2026/2027`
- Bulan Maret 2026 → Tahun ajaran: `2025/2026`

### 3. **Tampil di Kartu Absensi**
Tahun ajaran akan muncul di **footer kartu** (bagian bawah):
```
┌─────────────────────────────────────┐
│ [Kartu Absensi]                     │
│                                     │
│ NIS: 2024001    Tahun Ajaran 2025/2026 │
└─────────────────────────────────────┘
```

---

## 📍 Lokasi Pengaturan

### Path Menu:
```
Dashboard → Pengaturan → Informasi Sekolah → Tahun Ajaran
```

### Tampilan Input:
```
┌─────────────────────────────────────────┐
│ 📅 Tahun Ajaran                         │
│ ┌─────────────────────────────────────┐ │
│ │ 2025/2026                           │ │
│ └─────────────────────────────────────┘ │
│ Format: YYYY/YYYY (contoh: 2025/2026)  │
│ Tahun ajaran akan muncul di kartu      │
│ absensi.                                │
└─────────────────────────────────────────┘
```

---

## 🔄 Sinkronisasi

### Alur Data:
```
1. Admin update tahun ajaran di Pengaturan
   ↓
2. Data tersimpan di localStorage
   ↓
3. CardPrinter读取 settings.academicYear
   ↓
4. Tahun ajaran muncul di:
   - Preview kartu
   - Hasil cetak kartu siswa
   - Hasil cetak kartu guru
```

### Real-time Update:
- ✅ Perubahan tahun ajaran **langsung terlihat** di preview kartu
- ✅ Tidak perlu refresh halaman
- ✅ Sinkron antara kartu siswa dan guru

---

## 🎨 Implementasi Teknis

### File yang Dimodifikasi:

#### 1. **src/types.ts**
```typescript
export interface AppSettings {
  // ... existing settings
  academicYear: string; // ← Tambahan baru
}
```

#### 2. **src/store.ts**
```typescript
// Helper function
function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // Academic year starts in July (month 7)
  if (month >= 7) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}

const defaultSettings: AppSettings = {
  // ... existing settings
  academicYear: getCurrentAcademicYear(), // ← Auto-detect
};
```

#### 3. **src/components/SettingsPage.tsx**
```tsx
import { Calendar } from 'lucide-react';

// Input field
<div>
  <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
    <Calendar size={14} /> Tahun Ajaran
  </label>
  <input 
    type="text" 
    value={settings.academicYear}
    onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
    placeholder="Contoh: 2025/2026"
    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" 
  />
  <p className="text-xs text-gray-500 mt-1">
    Format: YYYY/YYYY (contoh: 2025/2026). 
    Tahun ajaran akan muncul di kartu absensi.
  </p>
</div>
```

#### 4. **src/components/CardPrinter.tsx**
```tsx
// Print template
<div class="card-footer">
  <span>${codeLabel}: ${code}</span>
  <span>Tahun Ajaran ${settings.academicYear}</span>
</div>

// Preview template
<div className="flex justify-between items-center mt-auto pt-2 border-t border-white/25 text-[8px] opacity-85 font-medium">
  <span>{codeLabel}: {code}</span>
  <span>Tahun Ajaran {settings.academicYear}</span>
</div>
```

---

## 📊 Contoh Penggunaan

### Skenario 1: Awal Tahun Ajaran Baru
```
1. Bulan Juli 2026 dimulai
2. Admin buka menu Pengaturan
3. Update tahun ajaran: "2026/2027"
4. Klik "Simpan Pengaturan"
5. Cetak kartu baru untuk siswa baru
6. ✓ Tahun ajaran "2026/2027" muncul di kartu
```

### Skenario 2: Cetak Ulang Kartu
```
1. Siswa kehilangan kartu
2. Admin buka menu Cetak Kartu
3. Pilih siswa yang bersangkutan
4. Klik "Cetak"
5. ✓ Kartu baru ter-print dengan tahun ajaran terbaru
```

### Skenario 3: Auto-Detect
```
1. Admin pertama kali buka aplikasi
2. Bulan saat ini: September 2026
3. Sistem auto-set tahun ajaran: "2026/2027"
4. ✓ Tidak perlu input manual
```

---

## 🎯 Keuntungan Fitur

### ✅ Fleksibilitas
- Bisa update tahun ajaran kapan saja
- Tidak perlu edit kode
- Format fleksibel (bisa custom)

### ✅ Otomatis
- Auto-detect tahun ajaran saat ini
- Tidak perlu input manual di awal
- Mengikuti kalender akademik Indonesia

### ✅ Terintegrasi
- Satu setting untuk semua kartu
- Sinkron antara siswa dan guru
- Real-time update

### ✅ Persisten
- Tersimpan di localStorage
- Tidak hilang setelah refresh
- Backup via Export/Import

---

## 🧪 Testing

### Test Case 1: Default Value
```
1. Hapus semua data (clear localStorage)
2. Buka aplikasi
3. Buka menu Pengaturan
4. ✓ Tahun ajaran terisi otomatis (contoh: "2025/2026")
```

### Test Case 2: Manual Update
```
1. Buka menu Pengaturan
2. Ubah tahun ajaran: "2024/2025" → "2025/2026"
3. Klik "Simpan"
4. Buka menu Cetak Kartu
5. Preview kartu
6. ✓ Footer menunjukkan "Tahun Ajaran 2025/2026"
```

### Test Case 3: Print Output
```
1. Pilih beberapa kartu untuk dicetak
2. Klik "Cetak"
3. Dialog print terbuka
4. ✓ Tahun ajaran muncul di hasil cetak
```

### Test Case 4: Format Validation
```
1. Input tahun ajaran: "abc/def"
2. Klik "Simpan"
3. ✓ Disimpan (tidak ada validasi strict)
4. Muncul di kartu: "Tahun Ajaran abc/def"
```

---

## 📝 Format Tahun Ajaran

### Format Standar:
```
YYYY/YYYY → 2025/2026
```

### Format Alternatif (Bisa Dikustom):
```
2025/2026     ← Standar
2025-2026     ← Dengan dash
2025-26       ← Short format
TA 2025/2026  ← Dengan prefix
```

### Rekomendasi:
- Gunakan format `YYYY/YYYY` untuk konsistensi
- Pastikan mudah dibaca
- Sesuai dengan dokumen resmi sekolah

---

## 🔧 Troubleshooting

### Masalah: Tahun ajaran tidak muncul di kartu
**Solusi:**
1. Cek apakah sudah save pengaturan
2. Refresh halaman cetak kartu
3. Cek console untuk error
4. Clear cache browser

### Masalah: Tahun ajaran salah
**Solusi:**
1. Buka menu Pengaturan
2. Update tahun ajaran manual
3. Klik "Simpan"
4. Cetak ulang kartu

### Masalah: Auto-detect salah
**Solusi:**
- Auto-detect berdasarkan bulan:
  - Juli-Desember: Tahun ajaran baru
  - Januari-Juni: Tahun ajaran lama
- Jika salah, update manual

---

## 📅 Kalender Akademik Indonesia

### Pembagian Tahun Ajaran:
```
Semester 1 (Ganjil):
  Juli - Desember

Semester 2 (Genap):
  Januari - Juni
```

### Logika Auto-Detect:
```javascript
if (month >= 7) {
  // Juli-Desember: Tahun ajaran baru
  return `${year}/${year + 1}`;
} else {
  // Januari-Juni: Tahun ajaran lama
  return `${year - 1}/${year}`;
}
```

---

## 🎓 Dokumentasi Lengkap

### Untuk Admin Sekolah:
1. **Update Tahun Ajaran** setiap awal tahun ajaran baru (Juli)
2. **Cetak ulang kartu** jika ada perubahan
3. **Backup data** sebelum update besar

### Untuk Operator:
1. **Cek tahun ajaran** sebelum cetak massal
2. **Test print** 1 kartu dulu
3. **Laporkan** jika ada masalah

### Untuk Developer:
1. **Field baru**: `academicYear` di AppSettings
2. **Auto-detect**: `getCurrentAcademicYear()`
3. **Integration**: CardPrinter读取 settings

---

## 📊 Statistik

- **File Dimodifikasi**: 4
  - `src/types.ts`
  - `src/store.ts`
  - `src/components/SettingsPage.tsx`
  - `src/components/CardPrinter.tsx`
- **Baris Kode Baru**: ~30
- **Dependencies**: 0 (tidak ada tambahan)
- **Breaking Changes**: Tidak ada

---

## 🚀 Fitur Selanjutnya (Opsional)

### Potensi Pengembangan:
1. **Dropdown tahun ajaran** (pilihan dari database)
2. **Auto-update** saat pergantian tahun ajaran
3. **Notifikasi** saat tahun ajaran berubah
4. **Histori** perubahan tahun ajaran
5. **Multi-tahun ajaran** untuk arsip

---

## 📞 Support

Jika mengalami masalah:
1. Cek dokumentasi di menu "Panduan Lengkap"
2. Verify tahun ajaran di Pengaturan
3. Test print 1 kartu dulu
4. Clear cache browser jika perlu

---

**Fitur Tahun Ajaran siap digunakan!** 📅✨

Tahun ajaran sekarang bisa diupdate dengan mudah melalui menu Pengaturan dan akan otomatis muncul di semua kartu absensi siswa dan guru.
