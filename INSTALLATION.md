# Instalasi LIMO PANCER APK di Android

## Requirements
- Android 7.0 (API 24) atau lebih tinggi
- Minimal 50MB storage space
- Camera permission untuk QR/Barcode scanning

## Cara Install

### Metode 1: Via File Manager
1. Download file `LIMO-PANCER-v1.0.0.apk`
2. Buka File Manager dan navigasi ke folder Downloads
3. Tap file APK
4. Tap "Install"
5. Tunggu proses selesai

### Metode 2: Via ADB (Developer)
```bash
adb install LIMO-PANCER-v1.0.0.apk
```

## Izin Akses

Saat pertama kali launch, aplikasi akan meminta:
- **Camera** - Untuk scanning QR/Barcode
- **Storage** - Untuk menyimpan data absensi

Tap "Allow" untuk semua permintaan.

## Setup Pertama

1. **Tab Scan Absen**
   - Kamera akan otomatis aktif
   - Arahkan ke QR/Barcode ID KULI
   - Tunggu konfirmasi absensi

2. **Tab Dashboard Admin**
   - Tap "Dashboard Admin"
   - Masukkan password: `adminlimopancer`
   - Kelola data KULI dan lihat rekap absensi

## Fitur Utama

✅ **Scan QR/Barcode** - Deteksi otomatis saat kamera aktif
✅ **Admin Dashboard** - Tambah, hapus, kelola KULI
✅ **Real-time Logs** - Lihat rekap absensi per hari
✅ **Print QR Card** - Generate dan cetak kartu presensi
✅ **Offline Mode** - Tetap berfungsi tanpa internet (data lokal)

## API Integration (Optional)

Jika ingin sinkronisasi dengan server backend:

1. Edit `cordova/www/js/app.js`
2. Ubah `API_BASE` ke endpoint server Anda:
```javascript
const API_BASE = 'http://your-server.com/api';
```
3. Rebuild APK

## Reset Aplikasi

Untuk reset data lokal:
1. Buka Settings > Apps > LIMO PANCER
2. Tap "Storage" > "Clear Data"
3. Launch ulang aplikasi

## FAQ

**Q: Aplikasi tidak bisa akses camera?**
A: Cek Settings > Permissions > LIMO PANCER > Berikan akses Camera

**Q: Password admin lupa?**
A: Uninstall dan reinstall aplikasi (akan reset ke default)

**Q: Bisa gunakan barcode biasa?**
A: Ya! Aplikasi support QR Code dan Barcode (Code128, EAN, dll)

**Q: Data absensi disimpan dimana?**
A: Data tersimpan lokal di device. Backup regular direkomendasikan.

## Support
Untuk pertanyaan lebih lanjut, hubungi: support@limopancer.com
