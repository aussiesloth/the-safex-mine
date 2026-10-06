# The Safex Mine — Instalasi Windows dan penggunaan pertama

> **Terjemahan komunitas.** Halaman ini adalah terjemahan proyek berbantuan AI untuk petunjuk penting instalasi dan keamanan. [Panduan instalasi bahasa Inggris](../../WINDOWS_INSTALLATION.md) tetap menjadi rujukan kanonis proyek. Koreksi bahasa dan istilah dipersilakan.

## 1. Unduh hanya dari rilis resmi

The Safex Mine adalah aplikasi Windows x64 **tanpa tanda tangan digital** yang berisi penambang CPU, proses pembantu dengan hak istimewa yang ditingkatkan, dan driver WinRing. Unduh penginstal hanya dari rilis GitHub resmi proyek.

## 2. Verifikasi SHA-256 **sebelum menjalankan**

Di PowerShell:

    Get-FileHash .\The-Safex-Mine_<version>_x64-setup.exe -Algorithm SHA256

Bandingkan hasilnya dengan teliti dengan SHA-256 yang dipublikasikan bersama rilis.

**Jika Microsoft Defender langsung mengarantina penginstal setelah diunduh:** pulihkan/izinkan terlebih dahulu **hanya penginstal tertentu yang baru diunduh itu**, lalu hitung SHA-256-nya dan **jangan jalankan** sampai hash cocok dengan nilai resmi.

## 3. SmartScreen dan antivirus

Karena rilis tidak ditandatangani dan berisi komponen penambangan, SmartScreen atau produk keamanan lain dapat memberi peringatan atau mengarantina berkas. Lanjutkan hanya setelah sumber dan hash diverifikasi.

Jangan menonaktifkan antivirus secara menyeluruh. Jangan mengecualikan Downloads, seluruh profil pengguna, atau seluruh drive. Jika setelah verifikasi rilis memang diperlukan pengecualian, batasi hanya ke:

    %LOCALAPPDATA%\The Safex Mine

## 4. Instalasi, bahasa, dan pemberitahuan risiko

Penginstal NSIS biasanya otomatis memilih Bahasa Indonesia berdasarkan bahasa tampilan Windows. Bahasa aplikasi tetap dapat diubah setelah aplikasi dijalankan.

Saat pertama kali dijalankan, **Pernyataan Pemahaman Risiko Penambangan — v1.0** ditampilkan dalam bahasa aplikasi yang didukung dan dipilih. Bacalah sebelum melanjutkan. **Keluar** menutup aplikasi tanpa menyimpan penerimaan. Bahasa Inggris tetap menjadi rujukan kanonis: [Pernyataan Pemahaman Risiko Penambangan v1.0](../../MINING_RISK_ACKNOWLEDGEMENT.md).

## 5. Proses pembantu UAC dan MSR

Aplikasi grafis berjalan sebagai pengguna biasa. Pada **Mulai Menambang** pertama dalam satu sesi, Windows meminta persetujuan UAC untuk:

    safex-mine-helper.exe

Hanya proses pembantu ini yang dijalankan dengan hak istimewa tinggi. Proses tersebut memulai dan mengawasi XMRig serta memungkinkan percobaan optimasi MSR. Jika keamanan Windows memblokir MSR, penambangan dapat terus berjalan dengan kinerja lebih rendah. Jangan menonaktifkan fitur keamanan hanya untuk meningkatkan hashrate.

## 6. Menghapus instalasi

Menghapus instalasi akan menghapus aplikasi. Pengecualian Defender yang Anda tambahkan secara manual dapat tetap ada; hapus secara manual sesudahnya jika tidak lagi diperlukan.

Bantuan lebih lanjut: [pemecahan masalah bahasa Inggris](../../../TROUBLESHOOTING.md).
