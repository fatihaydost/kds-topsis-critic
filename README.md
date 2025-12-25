# KDS - Karar Destek Sistemi

TOPSIS ve CRITIC yontemlerini kullanan cok kriterli karar verme uygulamasi.

## Ozellikler

- **TOPSIS**: Alternatifler arasinda siralama yapar
- **CRITIC**: Objektif kriter agirliklarini hesaplar
- Excel dosyasi yukleme destegi
- Interaktif grafikler ve tablolar

## Kurulum

```bash
# Repoyu klonla
git clone https://github.com/fatihaydost/kds-topsis-critic.git
cd kds-topsis-critic

# Bagimliliklari yukle
pip install -r requirements.txt

# Uygulamayi baslat
python app.py
```

Tarayicida `http://localhost:5000` adresine git.

## Kullanim

1. Ana sayfadan TOPSIS veya CRITIC yontemini sec
2. Excel dosyasi yukle veya manuel veri gir
3. Sonuclari grafik ve tablo olarak incele

## Teknolojiler

- Python / Flask
- NumPy, Pandas
- Chart.js
- Bootstrap
