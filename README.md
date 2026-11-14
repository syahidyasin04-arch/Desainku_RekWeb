# DesainKu — Website Jasa Desain + TOPSIS

Website front-end untuk tugas Rekayasa Web. Dibuat dengan HTML, CSS, dan JavaScript murni.

## Cara menjalankan
1. Ekstrak file ZIP.
2. Buka folder `desainku_topsis` di VS Code.
3. Buka `index.html` di browser, atau jalankan dengan ekstensi Live Server.
4. Internet hanya dibutuhkan untuk memuat Google Fonts; website inti tetap dapat dibuka secara lokal.

## Fitur yang berfungsi
- Navigasi responsif dan menu mobile.
- Kartu layanan dengan tombol yang mengarahkan pengguna ke formulir dan memilih layanan.
- Sistem rekomendasi paket menggunakan TOPSIS yang menghitung ulang saat bobot diubah.
- Filter kategori dan pencarian portofolio.
- Dialog detail untuk tiap proyek portofolio.
- Validasi formulir brief dan penyusunan draft email melalui `mailto:`.
- Layout responsif desktop, tablet, dan HP.

## Catatan akademik TOPSIS
Alternatif paket dan skor kriteria pada website adalah data simulasi untuk demonstrasi. Kriteria:
- Harga (cost): nilai lebih rendah lebih disukai.
- Kualitas desain (benefit): nilai lebih tinggi lebih disukai.
- Kecepatan (benefit): nilai lebih tinggi lebih disukai.
- Jumlah revisi (benefit): nilai lebih tinggi lebih disukai.

Alur perhitungan:
1. Normalisasi matriks keputusan dengan normalisasi vektor.
2. Kalikan hasil normalisasi dengan bobot kriteria yang dinormalisasi.
3. Tentukan solusi ideal positif dan negatif.
4. Hitung jarak setiap alternatif terhadap kedua solusi ideal.
5. Hitung nilai preferensi `Ci = D- / (D+ + D-)`, lalu urutkan dari nilai tertinggi.

## Batasan demo
Tidak ada backend, database, login, atau pengiriman formulir ke server. Formulir membuat draft email lokal, sehingga tidak mengklaim bahwa pesan sudah terkirim. Untuk penggunaan produksi, sambungkan formulir ke backend/API dan gunakan data paket yang benar-benar ditawarkan.
