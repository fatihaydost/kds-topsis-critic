import numpy as np
import pandas as pd


class CRITIC:
    """
    CRITIC (Criteria Importance Through Intercriteria Correlation) Yöntemi

    Objektif ağırlıklandırma yöntemi - kriter ağırlıklarını veri tabanlı hesaplar.
    """

    def __init__(self, decision_matrix, criteria_types):
        """
        Args:
            decision_matrix: numpy array (alternatifler x kriterler)
            criteria_types: list - her kriter için 'max' veya 'min'
        """
        self.decision_matrix = np.array(decision_matrix, dtype=float)
        self.criteria_types = criteria_types
        self.n_alternatives, self.n_criteria = self.decision_matrix.shape

        # Sonuçları sakla
        self.normalized_matrix = None
        self.std_devs = None
        self.correlation_matrix = None
        self.information_content = None
        self.weights = None
        self.steps = {}

    def normalize(self):
        """Adım 1: Min-Max Normalizasyonu"""
        self.normalized_matrix = np.zeros_like(self.decision_matrix)

        for j in range(self.n_criteria):
            col = self.decision_matrix[:, j]
            min_val = np.min(col)
            max_val = np.max(col)

            if max_val - min_val == 0:
                self.normalized_matrix[:, j] = 0
            else:
                if self.criteria_types[j] == 'max':
                    # Fayda kriteri: büyük değer iyi
                    self.normalized_matrix[:, j] = (col - min_val) / (max_val - min_val)
                else:
                    # Maliyet kriteri: küçük değer iyi
                    self.normalized_matrix[:, j] = (max_val - col) / (max_val - min_val)

        self.steps['normalized_matrix'] = self.normalized_matrix.tolist()
        return self.normalized_matrix

    def calculate_std_deviation(self):
        """Adım 2: Standart Sapma Hesaplama"""
        self.std_devs = np.std(self.normalized_matrix, axis=0, ddof=0)
        self.steps['std_devs'] = self.std_devs.tolist()
        return self.std_devs

    def calculate_correlation(self):
        """Adım 3: Korelasyon Matrisi Hesaplama"""
        n = self.n_criteria
        self.correlation_matrix = np.zeros((n, n))

        for i in range(n):
            for j in range(n):
                if i == j:
                    self.correlation_matrix[i, j] = 1.0
                else:
                    # Pearson korelasyon katsayısı
                    x = self.normalized_matrix[:, i]
                    y = self.normalized_matrix[:, j]

                    mean_x = np.mean(x)
                    mean_y = np.mean(y)

                    numerator = np.sum((x - mean_x) * (y - mean_y))
                    denominator = np.sqrt(np.sum((x - mean_x)**2) * np.sum((y - mean_y)**2))

                    if denominator == 0:
                        self.correlation_matrix[i, j] = 0
                    else:
                        self.correlation_matrix[i, j] = numerator / denominator

        self.steps['correlation_matrix'] = self.correlation_matrix.tolist()
        return self.correlation_matrix

    def calculate_information_content(self):
        """Adım 4: Bilgi İçeriği (C) Hesaplama"""
        # Her kriter için: C_j = σ_j * Σ(1 - r_jk)
        self.information_content = np.zeros(self.n_criteria)

        for j in range(self.n_criteria):
            conflict = np.sum(1 - self.correlation_matrix[j, :])
            self.information_content[j] = self.std_devs[j] * conflict

        self.steps['information_content'] = self.information_content.tolist()
        return self.information_content

    def calculate_weights(self):
        """Adım 5: Kriter Ağırlıklarını Hesaplama"""
        total = np.sum(self.information_content)

        if total == 0:
            self.weights = np.ones(self.n_criteria) / self.n_criteria
        else:
            self.weights = self.information_content / total

        self.steps['weights'] = self.weights.tolist()
        return self.weights

    def run(self):
        """Tüm adımları çalıştır"""
        self.normalize()
        self.calculate_std_deviation()
        self.calculate_correlation()
        self.calculate_information_content()
        self.calculate_weights()

        return {
            'weights': self.weights.tolist(),
            'normalized_matrix': self.normalized_matrix.tolist(),
            'std_devs': self.std_devs.tolist(),
            'correlation_matrix': self.correlation_matrix.tolist(),
            'information_content': self.information_content.tolist(),
            'steps': self.steps
        }
