# Project Instructions

## Communication
- Gunakan Bahasa Indonesia untuk komunikasi dengan user.
- Code, identifiers, commit messages, dan code comments menggunakan English.
- Saat perlu klarifikasi, tanyakan satu pertanyaan saja per giliran.
- Setiap pertanyaan klarifikasi harus memuat beberapa pilihan, satu pilihan bertanda `Recommended`, dan tetap membuka opsi jawaban manual.
- Jika pertanyaan tidak berdampak signifikan, ambil asumsi terbaik secara eksplisit dan lanjutkan.
- Jangan mengklaim pekerjaan selesai tanpa bukti verifikasi relevan.

## Project Scope
- Website: Persiapan Psikotes Kementerian Keuangan.
- Tahap pertama hanya modul Hitung Cepat: Tambah, Kurang, Kali, Bagi, Mix.
- Setiap kategori memiliki 10 paket, setiap paket 40 soal, timer 7 menit.
- Paket 1-5 memakai bilangan bulat, paket 6-10 memakai bilangan desimal.
- Jawaban dan pilihan jawaban harus berada di rentang 0-1000.
- Hasil `Kurang` tidak boleh negatif.
- Hasil `Bagi` harus rapi: bulat untuk paket integer, maksimal 2 desimal untuk paket decimal.
- Paket `Mix` wajib seimbang: 10 soal per operasi.

## Auth And Data
- UI login memakai Nomor WhatsApp + Password.
- Karena Supabase Phone provider dapat dinonaktifkan tanpa OTP/SMS setup, aplikasi memakai email internal sintetis dari Nomor WhatsApp untuk Supabase Auth password flow; Nomor WhatsApp tetap menjadi identitas user di UI dan database.
- Tidak ada public signup di UI.
- Superadmin mengelola user awal, reset password, perubahan nomor WhatsApp, deaktivasi user, dan reset histori jawaban.
- User boleh ganti password sendiri tetapi tidak boleh mengganti nomor WhatsApp sendiri.
- Histori nilai tersimpan di Supabase Postgres.
- Satu nomor WhatsApp hanya boleh memiliki satu sesi aktif; login baru memaksa sesi lama logout.

## Design Direction
- Ikuti gaya video referensi: hand-drawn rough wireframe, latar kertas grid, border hitam tebal/dashed, aksen merah-biru-kuning-hijau seperlunya.
- Hindari AI slop: jangan gunakan gradient hero generik, card SaaS generik, atau palet satu warna.
- Prioritaskan UI latihan yang langsung dapat digunakan, bukan landing page marketing.

## Git And Secrets
- Jangan commit `.env*`, token, service-role key, atau password.
- Jangan commit `video-website-referensi.mov`.
- Commit/push hanya setelah build/typecheck/test/lint relevan berhasil.
