import { useState } from 'react';
import { getSettings, saveSettings } from '../store';
import { AppSettings } from '../types';
import { Settings, Save, School, Volume2, Clock, Mic } from 'lucide-react';
import { testVoice, isVoiceSupported } from '../voice';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="text-gray-400" />
          Pengaturan
        </h1>
        <p className="text-gray-400 mt-1">Konfigurasi aplikasi absensi</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4">
          ✓ Pengaturan berhasil disimpan!
        </div>
      )}

      {/* School Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <School size={20} className="text-emerald-400" /> Informasi Sekolah
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nama Sekolah</label>
            <input type="text" value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Alamat Sekolah</label>
            <input type="text" value={settings.schoolAddress}
              onChange={(e) => setSettings({ ...settings, schoolAddress: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                <Clock size={14} /> Jam Masuk
              </label>
              <input type="time" value={settings.schoolStartTime}
                onChange={(e) => setSettings({ ...settings, schoolStartTime: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                <Clock size={14} /> Jam Pulang
              </label>
              <input type="time" value={settings.schoolEndTime}
                onChange={(e) => setSettings({ ...settings, schoolEndTime: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Settings */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Volume2 size={20} className="text-blue-400" /> Pengaturan Scanner
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Suara Notifikasi</p>
              <p className="text-sm text-gray-400">Bunyi beep saat scan berhasil</p>
            </div>
            <button onClick={() => setSettings({ ...settings, scanSound: !settings.scanSound })}
              className={`w-14 h-7 rounded-full transition-all ${settings.scanSound ? 'bg-emerald-500' : 'bg-gray-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-all mx-1 ${settings.scanSound ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Auto Tanggal</p>
              <p className="text-sm text-gray-400">Gunakan tanggal otomatis</p>
            </div>
            <button onClick={() => setSettings({ ...settings, autoDate: !settings.autoDate })}
              className={`w-14 h-7 rounded-full transition-all ${settings.autoDate ? 'bg-emerald-500' : 'bg-gray-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-all mx-1 ${settings.autoDate ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Mic size={20} className="text-purple-400" /> Pengaturan Suara Absensi
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Sebutkan Nama Saat Absen</p>
              <p className="text-sm text-gray-400">Suara akan menyebutkan nama siswa/guru saat scan</p>
            </div>
            <button onClick={() => setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
              className={`w-14 h-7 rounded-full transition-all ${settings.voiceEnabled ? 'bg-purple-500' : 'bg-gray-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-all mx-1 ${settings.voiceEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>

          {settings.voiceEnabled && (
            <>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Kecepatan Suara: {settings.voiceSpeed.toFixed(1)}x
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={settings.voiceSpeed}
                  onChange={(e) => setSettings({ ...settings, voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Lambat</span>
                  <span>Normal</span>
                  <span>Cepat</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Nada Suara: {settings.voicePitch.toFixed(1)}
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={settings.voicePitch}
                  onChange={(e) => setSettings({ ...settings, voicePitch: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Rendah</span>
                  <span>Normal</span>
                  <span>Tinggi</span>
                </div>
              </div>

              <button
                onClick={() => testVoice(settings)}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Mic size={18} />
                Test Suara
              </button>

              {!isVoiceSupported() && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">
                  ⚠️ Browser Anda tidak mendukung Web Speech API. Gunakan Chrome, Edge, atau Safari.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scanner Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4">Informasi Scanner</h3>
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Model</span>
            <span className="text-white font-mono">CASHCOW HC-P10 USB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Koneksi</span>
            <span className="text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              USB HID (Keyboard Emulation)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Mode</span>
            <span className="text-white">Barcode → Text Input</span>
          </div>
        </div>
        <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-white">Cara Penggunaan:</strong><br />
            1. Hubungkan scanner CASHCOW HC-P10 ke port USB<br />
            2. Scanner terdeteksi otomatis sebagai keyboard<br />
            3. Buka halaman Scan Absen Siswa/Guru<br />
            4. Pilih mode Masuk atau Pulang<br />
            5. Arahkan scanner ke barcode kartu<br />
            6. Data tercatat + notifikasi WA terkirim
          </p>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4">Tentang Aplikasi</h3>
        <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-sm text-gray-400">
          <p><strong className="text-white">SIHADIR</strong> - Sistem Absensi Digital v2.0</p>
          <p>Fitur: Absensi Siswa & Guru, Scan Barcode, Notifikasi WhatsApp, Rekap Bulanan/Tahunan</p>
          <p>Scanner: CASHCOW HC-P10 USB (Barcode Scanner)</p>
          <p className="text-xs mt-2">Data disimpan di localStorage browser. Gunakan Import/Export untuk backup.</p>
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
        <Save size={20} /> Simpan Pengaturan
      </button>
    </div>
  );
}
