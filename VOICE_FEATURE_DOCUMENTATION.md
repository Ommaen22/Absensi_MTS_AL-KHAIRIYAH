# 🎤 Fitur Suara Toggle Penyebutan Nama Saat Absensi

## ✨ Deskripsi Fitur

Fitur baru yang memungkinkan aplikasi untuk **menyebutkan nama siswa/guru secara otomatis** menggunakan suara saat melakukan scan absensi. Fitur ini menggunakan **Web Speech API** yang sudah tersedia di browser modern.

---

## 🎯 Cara Kerja

### Saat Scan Berhasil:
1. **Siswa**: "Ahmad Fauzi, selamat datang" (masuk) atau "Ahmad Fauzi, hati-hati di jalan" (pulang)
2. **Guru**: "Budi Santoso, selamat datang" (masuk) atau "Budi Santoso, hati-hati di jalan" (pulang)

### Pesan Suara:
- **Absen Masuk**: `"{Nama}, selamat datang"`
- **Absen Pulang**: `"{Nama}, hati-hati di jalan"`

---

## ⚙️ Pengaturan

### Lokasi Pengaturan
**Menu**: `Pengaturan` → `Pengaturan Suara Absensi`

### Opsi yang Tersedia:

#### 1. **Toggle On/Off**
- Aktifkan/nonaktifkan fitur suara
- Default: **Aktif** ✅

#### 2. **Kecepatan Suara** (0.5x - 2.0x)
- **0.5x**: Sangat lambat
- **1.0x**: Normal (default)
- **2.0x**: Sangat cepat
- Slider untuk mengatur kecepatan

#### 3. **Nada Suara** (0.5 - 2.0)
- **0.5**: Nada rendah (deep voice)
- **1.0**: Normal (default)
- **2.0**: Nada tinggi (high pitch)
- Slider untuk mengatur pitch

#### 4. **Test Suara**
- Tombol untuk test konfigurasi suara
- Akan mengucapkan: "Test Suara, selamat datang"

---

## 🌐 Kompatibilitas Browser

### ✅ Browser yang Didukung:
- **Google Chrome** (Rekomendasi)
- **Microsoft Edge**
- **Safari** (macOS/iOS)
- **Opera**

### ❌ Browser yang Tidak Didukung:
- Firefox (dukungan terbatas)
- Internet Explorer

### ⚠️ Catatan Penting:
- Fitur ini menggunakan **Web Speech API**
- Tidak memerlukan library tambahan
- Bekerja secara offline (tidak perlu internet)
- Kualitas suara tergantung pada browser dan OS

---

## 🎨 Implementasi Teknis

### File yang Dimodifikasi:

#### 1. **src/types.ts**
```typescript
export interface AppSettings {
  // ... existing settings
  voiceEnabled: boolean;
  voiceSpeed: number;
  voicePitch: number;
}
```

#### 2. **src/store.ts**
```typescript
const defaultSettings: AppSettings = {
  // ... existing defaults
  voiceEnabled: true,
  voiceSpeed: 1.0,
  voicePitch: 1.0,
};
```

#### 3. **src/voice.ts** (File Baru)
```typescript
export function speakName(
  name: string,
  type: 'masuk' | 'pulang',
  settings: AppSettings
): void {
  if (!settings.voiceEnabled) return;
  
  const message = type === 'masuk'
    ? `${name}, selamat datang`
    : `${name}, hati-hati di jalan`;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'id-ID';
  utterance.rate = settings.voiceSpeed;
  utterance.pitch = settings.voicePitch;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}
```

#### 4. **src/components/ScanPageUnified.tsx**
```typescript
import { speakName } from '../voice';

// Saat scan siswa berhasil:
speakName(student.name, absenType, settings);

// Saat scan guru berhasil:
speakName(teacher.name, absenType, settings);
```

#### 5. **src/components/SettingsPage.tsx**
- Tambah section "Pengaturan Suara Absensi"
- Toggle on/off
- Slider kecepatan dan pitch
- Tombol test suara

---

## 🎵 Contoh Penggunaan

### Skenario 1: Absen Masuk Siswa
```
1. Siswa scan barcode
2. Sistem mencatat absensi
3. Suara: "Ahmad Fauzi, selamat datang"
4. Notifikasi WhatsApp terkirim ke orang tua
```

### Skenario 2: Absen Pulang Guru
```
1. Guru scan barcode
2. Sistem mencatat absensi
3. Suara: "Budi Santoso, hati-hati di jalan"
```

### Skenario 3: Fitur Dimatikan
```
1. Admin menonaktifkan fitur suara di pengaturan
2. Siswa scan barcode
3. Hanya bunyi beep (tidak ada suara)
4. Absensi tetap tercatat normal
```

---

## 🔧 Troubleshooting

### Masalah: Suara tidak keluar
**Solusi:**
1. Cek toggle sudah aktif di pengaturan
2. Cek volume speaker/laptop
3. Test dengan tombol "Test Suara"
4. Gunakan browser Chrome/Edge
5. Izinkan audio di browser settings

### Masalah: Suara terlalu cepat/lambat
**Solusi:**
1. Buka Pengaturan → Pengaturan Suara Absensi
2. Atur slider "Kecepatan Suara" ke 1.0 (normal)
3. Test dengan tombol "Test Suara"

### Masalah: Suara terdengar aneh
**Solusi:**
1. Atur "Nada Suara" ke 1.0 (normal)
2. Pastikan menggunakan bahasa Indonesia
3. Coba browser yang berbeda

### Masalah: Browser tidak mendukung
**Solusi:**
1. Gunakan Google Chrome (terbaru)
2. Atau Microsoft Edge
3. Update browser ke versi terbaru

---

## 💡 Tips Penggunaan

### Untuk Sekolah:
1. **Aktifkan fitur** untuk pengalaman lebih interaktif
2. **Atur kecepatan** 1.0x untuk kejelasan
3. **Test suara** sebelum digunakan di hari pertama
4. **Informasikan** ke siswa/guru tentang fitur ini

### Untuk Admin:
1. **Backup pengaturan** sebelum perubahan
2. **Test di beberapa device** untuk konsistensi
3. **Monitor feedback** dari pengguna
4. **Adjust speed/pitch** sesuai preferensi

### Untuk Developer:
1. **Voice API** bekerja asynchronous
2. **Cancel previous speech** sebelum speak baru
3. **Handle error** dengan graceful fallback
4. **Test cross-browser** untuk kompatibilitas

---

## 📊 Statistik

- **File Baru**: 1 (voice.ts)
- **File Dimodifikasi**: 4
- **Baris Kode Baru**: ~150
- **Dependencies**: 0 (menggunakan Web Speech API native)
- **Browser Support**: 90%+ browser modern

---

## 🚀 Fitur Selanjutnya (Opsional)

### Potensi Pengembangan:
1. **Multi-language support** (Inggris, Jawa, dll)
2. **Custom voice messages** per sekolah
3. **Voice selection** (pilih suara pria/wanita)
4. **Volume control** per device
5. **Voice preview** sebelum save
6. **Export voice settings** untuk backup

---

## 📝 Changelog

### Version 1.0.0 (2024)
- ✅ Initial release
- ✅ Voice toggle on/off
- ✅ Speed control (0.5x - 2.0x)
- ✅ Pitch control (0.5 - 2.0)
- ✅ Test voice function
- ✅ Indonesian language support
- ✅ Browser compatibility check

---

## 🎓 Dokumentasi Web Speech API

### Resources:
- [MDN Web Docs - SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Can I Use - Speech Synthesis](https://caniuse.com/speech-synthesis)
- [Web Speech API Demo](https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/)

### Browser Support:
- Chrome: ✅ Full support
- Edge: ✅ Full support
- Safari: ✅ Full support
- Firefox: ⚠️ Limited support
- IE: ❌ No support

---

## 📞 Support

Jika mengalami masalah dengan fitur suara:
1. Cek dokumentasi di menu "Panduan Lengkap"
2. Test dengan tombol "Test Suara"
3. Gunakan browser Chrome terbaru
4. Hubungi support jika masih ada masalah

---

**Fitur ini dirancang untuk meningkatkan pengalaman pengguna dan memberikan feedback audio yang jelas saat absensi!** 🎤✨
