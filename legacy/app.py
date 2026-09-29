from flask import Flask, render_template, request, jsonify, session, send_file
import numpy as np
import pandas as pd
import os
import io
import json
from methods import CRITIC, TOPSIS

app = Flask(__name__)
app.secret_key = 'kds_secret_key_2024'

# Mutlak yollar kullan
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
DATA_FOLDER = os.path.join(BASE_DIR, 'data')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)


def save_results(filename, data):
    """Sonuclari JSON dosyasina kaydet"""
    # Klasorun var oldugundan emin ol
    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER)
    filepath = os.path.join(DATA_FOLDER, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_results(filename):
    """Sonuclari JSON dosyasindan yukle"""
    filepath = os.path.join(DATA_FOLDER, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def parse_value(val):
    """Degeri float'a cevir, virgulu noktaya cevir"""
    import datetime

    # None veya NaN kontrolu
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return 0.0

    # Zaten sayi ise
    if isinstance(val, (int, float)):
        return float(val)

    # datetime ise atla
    if isinstance(val, (datetime.datetime, datetime.date)):
        return 0.0

    # String ise
    if isinstance(val, str):
        val = val.replace(',', '.').strip()
        if val == '' or val.lower() in ['nan', 'none', 'null']:
            return 0.0
        try:
            return float(val)
        except:
            return 0.0

    # Diger turler
    try:
        return float(val)
    except:
        return 0.0


@app.route('/')
def index():
    """Ana sayfa"""
    return render_template('index.html')


# ========== CRITIC ROUTES ==========

@app.route('/critic')
def critic_page():
    """CRITIC veri giris sayfasi"""
    return render_template('critic_input.html')


@app.route('/critic/upload-excel', methods=['POST'])
def critic_upload_excel():
    """CRITIC icin Excel dosyasini yukle ve parse et"""
    return upload_excel_generic()


@app.route('/critic/analyze', methods=['POST'])
def critic_analyze():
    """CRITIC analizi yap"""
    try:
        data = request.get_json()

        # Verileri al ve float'a cevir
        raw_matrix = data['matrix']
        parsed_matrix = [[parse_value(cell) for cell in row] for row in raw_matrix]
        decision_matrix = np.array(parsed_matrix, dtype=float)
        criteria_types = data['criteria_types']
        criteria_names = data['criteria_names']
        alternative_names = data['alternative_names']

        results = {
            'criteria_names': criteria_names,
            'alternative_names': alternative_names,
            'decision_matrix': decision_matrix.tolist(),
            'criteria_types': criteria_types
        }

        # CRITIC
        critic = CRITIC(decision_matrix, criteria_types)
        critic_result = critic.run()
        results['critic'] = critic_result

        # Dosyaya kaydet (session yerine)
        save_results('critic_results.json', results)

        return jsonify({
            'success': True,
            'results': results
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/critic/dashboard')
def critic_dashboard():
    """CRITIC dashboard sayfasi"""
    results = load_results('critic_results.json')
    return render_template('critic_dashboard.html', results=results)


@app.route('/critic/download-excel')
def critic_download_excel():
    """CRITIC sonuclarini Excel olarak indir"""
    results = load_results('critic_results.json')
    if not results:
        return jsonify({'error': 'Sonuc bulunamadi'}), 404

    # Excel dosyasi olustur
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Kriter agirliklari
        weights_df = pd.DataFrame({
            'Kriter': results['criteria_names'],
            'Yon': results['criteria_types'],
            'Agirlik': results['critic']['weights']
        })
        weights_df.to_excel(writer, sheet_name='Kriter Agirliklari', index=False)

        # Karar matrisi
        matrix_df = pd.DataFrame(
            results['decision_matrix'],
            columns=results['criteria_names'],
            index=results['alternative_names']
        )
        matrix_df.to_excel(writer, sheet_name='Karar Matrisi')

        # Normalize matris
        norm_df = pd.DataFrame(
            results['critic']['normalized_matrix'],
            columns=results['criteria_names'],
            index=results['alternative_names']
        )
        norm_df.to_excel(writer, sheet_name='Normalize Matris')

        # TOPSIS icin hazir format
        topsis_ready = pd.DataFrame()
        topsis_ready[''] = [''] + results['criteria_types'] + results['alternative_names']

        for i, crit in enumerate(results['criteria_names']):
            col_data = [crit, results['critic']['weights'][i]]
            for row in results['decision_matrix']:
                col_data.append(row[i])
            topsis_ready[f'C{i+1}'] = col_data

        topsis_ready.to_excel(writer, sheet_name='TOPSIS Hazir Format', index=False)

    output.seek(0)
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='critic_sonuclari.xlsx'
    )


# ========== TOPSIS ROUTES ==========

@app.route('/topsis')
def topsis_page():
    """TOPSIS veri giris sayfasi"""
    return render_template('topsis_input.html')


@app.route('/topsis/upload-excel', methods=['POST'])
def topsis_upload_excel():
    """TOPSIS icin Excel dosyasini yukle ve parse et"""
    return upload_excel_with_weights()


@app.route('/topsis/analyze', methods=['POST'])
def topsis_analyze():
    """TOPSIS analizi yap"""
    try:
        data = request.get_json()

        # Verileri al ve float'a cevir
        raw_matrix = data['matrix']
        parsed_matrix = [[parse_value(cell) for cell in row] for row in raw_matrix]
        decision_matrix = np.array(parsed_matrix, dtype=float)

        raw_weights = data['weights']
        weights = np.array([parse_value(w) for w in raw_weights], dtype=float)

        criteria_types = data['criteria_types']
        criteria_names = data['criteria_names']
        alternative_names = data['alternative_names']

        results = {
            'criteria_names': criteria_names,
            'alternative_names': alternative_names,
            'decision_matrix': decision_matrix.tolist(),
            'criteria_types': criteria_types,
            'weights': weights.tolist()
        }

        # TOPSIS
        topsis = TOPSIS(decision_matrix, weights, criteria_types)
        topsis_result = topsis.run()
        results['topsis'] = topsis_result

        # Dosyaya kaydet (session yerine)
        save_results('topsis_results.json', results)

        return jsonify({
            'success': True,
            'results': results
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/topsis/dashboard')
def topsis_dashboard():
    """TOPSIS dashboard sayfasi"""
    results = load_results('topsis_results.json')
    return render_template('topsis_dashboard.html', results=results)


@app.route('/topsis/download-excel')
def topsis_download_excel():
    """TOPSIS sonuclarini Excel olarak indir"""
    results = load_results('topsis_results.json')
    if not results:
        return jsonify({'error': 'Sonuc bulunamadi'}), 404

    # Excel dosyasi olustur
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Siralama sonuclari
        ranking_df = pd.DataFrame({
            'Alternatif': results['alternative_names'],
            'Yakinlik Katsayisi (C)': results['topsis']['closeness'],
            'Siralama': results['topsis']['ranking'],
            'D+ (Ideal Uzaklik)': results['topsis']['distance_positive'],
            'D- (Negatif-Ideal Uzaklik)': results['topsis']['distance_negative']
        })
        ranking_df = ranking_df.sort_values('Siralama')
        ranking_df.to_excel(writer, sheet_name='Siralama Sonuclari', index=False)

        # Agirlikli normalize matris
        weighted_df = pd.DataFrame(
            results['topsis']['weighted_matrix'],
            columns=results['criteria_names'],
            index=results['alternative_names']
        )
        weighted_df.to_excel(writer, sheet_name='Agirlikli Normalize Matris')

        # Ideal cozumler
        ideal_df = pd.DataFrame({
            'Kriter': results['criteria_names'],
            'Ideal (A+)': results['topsis']['ideal_positive'],
            'Negatif-Ideal (A-)': results['topsis']['ideal_negative']
        })
        ideal_df.to_excel(writer, sheet_name='Ideal Cozumler', index=False)

    output.seek(0)
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='topsis_sonuclari.xlsx'
    )


# ========== HELPER FUNCTIONS ==========

def upload_excel_generic():
    """Genel Excel yukleme fonksiyonu"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Dosya bulunamadi'})

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Dosya secilmedi'})

        if not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({'success': False, 'error': 'Sadece Excel dosyalari (.xlsx, .xls) desteklenir'})

        # Excel dosyasini oku
        df = pd.read_excel(file, header=None)
        data = df.values.tolist()

        # Formati belirle
        first_row = [str(x).lower().strip() for x in data[0][1:] if pd.notna(x)]
        is_advanced_format = all(x in ['min', 'max', 'maks', 'maliyet', 'fayda'] for x in first_row if x)

        if is_advanced_format:
            # Gelismis format: Ilk satir yonler
            criteria_types = []
            for val in data[0][1:]:
                if pd.notna(val):
                    val_str = str(val).lower().strip()
                    if val_str in ['min', 'maliyet']:
                        criteria_types.append('min')
                    elif val_str in ['max', 'maks', 'fayda']:
                        criteria_types.append('max')

            criteria_names = [str(x) for x in data[1][1:] if pd.notna(x)]
            alternative_names = [str(row[0]) for row in data[2:] if pd.notna(row[0]) and not str(row[0]).lower().startswith(('min', 'max', 'maks'))]
            matrix = []
            for row in data[2:]:
                if pd.notna(row[0]) and not str(row[0]).lower().startswith(('min', 'max', 'maks')):
                    matrix_row = [parse_value(x) for x in row[1:len(criteria_names)+1]]
                    matrix.append(matrix_row)
        else:
            # Basit format: Ilk satir kriter adlari
            criteria_names = [str(x) for x in data[0][1:] if pd.notna(x)]
            criteria_types = ['max'] * len(criteria_names)
            alternative_names = [str(row[0]) for row in data[1:] if pd.notna(row[0])]
            matrix = []
            for row in data[1:]:
                if pd.notna(row[0]):
                    matrix_row = [parse_value(x) for x in row[1:len(criteria_names)+1]]
                    matrix.append(matrix_row)

        return jsonify({
            'success': True,
            'data': {
                'criteria_names': criteria_names,
                'criteria_types': criteria_types,
                'alternative_names': alternative_names,
                'matrix': matrix
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


def upload_excel_with_weights():
    """Agirlikli Excel yukleme fonksiyonu (TOPSIS icin)"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Dosya bulunamadi'})

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Dosya secilmedi'})

        if not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({'success': False, 'error': 'Sadece Excel dosyalari (.xlsx, .xls) desteklenir'})

        # Excel dosyasini oku
        df = pd.read_excel(file, header=None)
        data = df.values.tolist()

        # TOPSIS format:
        # Satir 0: Kriter adlari
        # Satir 1: Kriter yonleri (min/max)
        # Satir 2: Agirliklar
        # Satir 3+: Alternatifler

        criteria_names = [str(x) for x in data[0][1:] if pd.notna(x)]
        n_criteria = len(criteria_names)

        # Kriter yonleri
        criteria_types = []
        for val in data[1][1:n_criteria+1]:
            if pd.notna(val):
                val_str = str(val).lower().strip()
                if val_str in ['min', 'maliyet']:
                    criteria_types.append('min')
                else:
                    criteria_types.append('max')
            else:
                criteria_types.append('max')

        # Agirliklar
        weights = [parse_value(x) for x in data[2][1:n_criteria+1]]

        # Alternatifler
        alternative_names = []
        matrix = []
        for row in data[3:]:
            if pd.notna(row[0]):
                alternative_names.append(str(row[0]))
                matrix_row = [parse_value(x) for x in row[1:n_criteria+1]]
                matrix.append(matrix_row)

        return jsonify({
            'success': True,
            'data': {
                'criteria_names': criteria_names,
                'criteria_types': criteria_types,
                'weights': weights,
                'alternative_names': alternative_names,
                'matrix': matrix
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


# ========== LEGACY ROUTES (eski uyumluluk) ==========

@app.route('/input')
def input_page():
    """Eski veri giris sayfasi - CRITIC'e yonlendir"""
    return render_template('critic_input.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    """Eski analyze - CRITIC'e yonlendir"""
    return critic_analyze()


@app.route('/upload-excel', methods=['POST'])
def upload_excel():
    """Eski upload - CRITIC'e yonlendir"""
    return critic_upload_excel()


@app.route('/dashboard')
def dashboard_page():
    """Eski dashboard - CRITIC'e yonlendir"""
    return critic_dashboard()


@app.route('/results')
def results_page():
    """Sonuc sayfasi"""
    results = load_results('critic_results.json')
    return render_template('results.html', results=results)


@app.route('/api/results')
def api_results():
    """Sonuclari JSON olarak dondur"""
    results = load_results('critic_results.json')
    if results:
        return jsonify(results)
    return jsonify({'error': 'No results found'}), 404


if __name__ == '__main__':
    app.run(debug=True, port=5000)
