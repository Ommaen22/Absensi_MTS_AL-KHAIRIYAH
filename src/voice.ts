import { AppSettings } from './types';

/**
 * Voice Notification Service
 * Menggunakan Web Speech API untuk menyebutkan nama saat absensi
 */

export function speakName(
  name: string,
  type: 'masuk' | 'pulang',
  settings: AppSettings
): void {
  if (!settings.voiceEnabled) return;

  // Check if browser supports speech synthesis
  if (!('speechSynthesis' in window)) {
    console.warn('Browser tidak mendukung Web Speech API');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create message based on type
  const message = type === 'masuk'
    ? `${name}, selamat datang`
    : `${name}, hati-hati di jalan`;

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(message);

  // Set voice properties
  utterance.lang = 'id-ID'; // Indonesian
  utterance.rate = settings.voiceSpeed; // Speed (0.1 - 10)
  utterance.pitch = settings.voicePitch; // Pitch (0 - 2)
  utterance.volume = 1.0; // Volume (0 - 1)

  // Try to find Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  const indonesianVoice = voices.find(voice => 
    voice.lang.includes('id') || voice.lang.includes('ID')
  );

  if (indonesianVoice) {
    utterance.voice = indonesianVoice;
  }

  // Speak
  window.speechSynthesis.speak(utterance);
}

export function testVoice(settings: AppSettings): boolean {
  if (!('speechSynthesis' in window)) {
    alert('Browser Anda tidak mendukung Web Speech API. Gunakan Chrome, Edge, atau Safari.');
    return false;
  }

  speakName('Test Suara', 'masuk', settings);
  return true;
}

export function stopVoice(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isVoiceSupported(): boolean {
  return 'speechSynthesis' in window;
}
