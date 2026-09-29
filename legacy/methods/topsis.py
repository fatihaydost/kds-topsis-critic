import numpy as np


class TOPSIS:
    """
    TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
    Cok Kriterli Karar Verme Yontemi

    Adimlar:
    1. Karar matrisinin normalizasyonu (vektör normalizasyonu)
    2. Agirlikli normalize matrisin olusturulmasi
    3. Ideal (A+) ve negatif-ideal (A-) cozumlerin belirlenmesi
    4. Alternatiflerin ideal ve negatif-ideal cozumlere uzakliklarinin hesaplanmasi
    5. Yakinlik katsayisinin hesaplanmasi ve siralanmasi
    """

    def __init__(self, decision_matrix, weights, criteria_types):
        """
        Args:
            decision_matrix: Karar matrisi (numpy array)
            weights: Kriter agirliklari (liste veya numpy array)
            criteria_types: Kriter tipleri ('max' veya 'min')
        """
        self.decision_matrix = np.array(decision_matrix, dtype=float)
        self.weights = np.array(weights, dtype=float)
        self.criteria_types = criteria_types
        self.n_alternatives, self.n_criteria = self.decision_matrix.shape

    def normalize(self):
        """1. Adim: Vektor normalizasyonu"""
        # Her sutunun karesinin toplaminin karekoku
        norm_factors = np.sqrt(np.sum(self.decision_matrix ** 2, axis=0))
        # Sifira bolunmeyi onle
        norm_factors[norm_factors == 0] = 1
        self.normalized_matrix = self.decision_matrix / norm_factors
        return self.normalized_matrix

    def weighted_normalize(self):
        """2. Adim: Agirlikli normalize matris"""
        self.weighted_matrix = self.normalized_matrix * self.weights
        return self.weighted_matrix

    def find_ideal_solutions(self):
        """3. Adim: Ideal (A+) ve negatif-ideal (A-) cozumler"""
        self.ideal_positive = np.zeros(self.n_criteria)
        self.ideal_negative = np.zeros(self.n_criteria)

        for j in range(self.n_criteria):
            if self.criteria_types[j] == 'max':
                self.ideal_positive[j] = np.max(self.weighted_matrix[:, j])
                self.ideal_negative[j] = np.min(self.weighted_matrix[:, j])
            else:  # min
                self.ideal_positive[j] = np.min(self.weighted_matrix[:, j])
                self.ideal_negative[j] = np.max(self.weighted_matrix[:, j])

        return self.ideal_positive, self.ideal_negative

    def calculate_distances(self):
        """4. Adim: Ideal ve negatif-ideal cozumlere uzakliklar"""
        # Ideal cozume uzaklik (D+)
        self.distance_positive = np.sqrt(np.sum((self.weighted_matrix - self.ideal_positive) ** 2, axis=1))
        # Negatif-ideal cozume uzaklik (D-)
        self.distance_negative = np.sqrt(np.sum((self.weighted_matrix - self.ideal_negative) ** 2, axis=1))

        return self.distance_positive, self.distance_negative

    def calculate_closeness(self):
        """5. Adim: Yakinlik katsayisi (C) ve siralama"""
        # C = D- / (D+ + D-)
        denominator = self.distance_positive + self.distance_negative
        # Sifira bolunmeyi onle
        denominator[denominator == 0] = 1
        self.closeness = self.distance_negative / denominator

        # Siralama (buyukten kucuge)
        self.ranking = np.argsort(-self.closeness) + 1  # 1'den baslayan siralama

        return self.closeness, self.ranking

    def run(self):
        """Tum adimlari calistir ve sonuclari dondur"""
        self.normalize()
        self.weighted_normalize()
        self.find_ideal_solutions()
        self.calculate_distances()
        self.calculate_closeness()

        # Siralama indekslerini duzelt
        ranking_order = np.argsort(-self.closeness)
        final_ranking = np.zeros(self.n_alternatives, dtype=int)
        for rank, idx in enumerate(ranking_order):
            final_ranking[idx] = rank + 1

        return {
            'normalized_matrix': self.normalized_matrix.tolist(),
            'weighted_matrix': self.weighted_matrix.tolist(),
            'ideal_positive': self.ideal_positive.tolist(),
            'ideal_negative': self.ideal_negative.tolist(),
            'distance_positive': self.distance_positive.tolist(),
            'distance_negative': self.distance_negative.tolist(),
            'closeness': self.closeness.tolist(),
            'ranking': final_ranking.tolist(),
            'weights_used': self.weights.tolist()
        }
