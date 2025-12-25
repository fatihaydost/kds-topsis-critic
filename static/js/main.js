/**
 * KDS - Karar Destek Sistemi
 * Main JavaScript File
 */

// Global utility functions

/**
 * Format number to fixed decimal places
 */
function formatNumber(num, decimals = 4) {
    return parseFloat(num).toFixed(decimals);
}

/**
 * Show loading spinner
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Yukleniyor...</span>
                </div>
                <p class="mt-2">Islem yapiliyor...</p>
            </div>
        `;
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('main.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

/**
 * Validate matrix input
 */
function validateMatrix(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (isNaN(matrix[i][j]) || matrix[i][j] === null) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Export table to CSV
 */
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => {
            rowData.push('"' + col.innerText.replace(/"/g, '""') + '"');
        });
        csv.push(rowData.join(','));
    });

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}

/**
 * Print specific element
 */
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>KDS - Sonuc Raporu</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { padding: 20px; }
                .card { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>KDS - Karar Destek Sistemi Raporu</h1>
            <hr>
            ${element.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => {
        new bootstrap.Tooltip(el);
    });
}

/**
 * Smooth scroll to element
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Color scale for heatmap values (-1 to 1)
 */
function getCorrelationColor(value) {
    if (value >= 0.7) return '#28a745';
    if (value >= 0.3) return '#90EE90';
    if (value >= -0.3) return '#ffffff';
    if (value >= -0.7) return '#ffcccb';
    return '#dc3545';
}

/**
 * Create matrix from form inputs
 */
function createMatrixFromInputs(selector, rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const input = document.querySelector(`${selector}[data-row="${i}"][data-col="${j}"]`);
            row.push(parseFloat(input?.value) || 0);
        }
        matrix.push(row);
    }
    return matrix;
}

/**
 * Populate matrix inputs from data
 */
function populateMatrixInputs(selector, matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const input = document.querySelector(`${selector}[data-row="${i}"][data-col="${j}"]`);
            if (input) {
                input.value = matrix[i][j];
            }
        }
    }
}

/**
 * Sample data for testing
 */
const sampleData = {
    alternatives: ['A1', 'A2', 'A3', 'A4', 'A5'],
    criteria: ['Fiyat', 'Kalite', 'Dayaniklilik', 'Garanti'],
    types: ['min', 'max', 'max', 'max'],
    matrix: [
        [5000, 8, 7, 2],
        [4500, 7, 8, 3],
        [6000, 9, 6, 2],
        [5500, 8, 7, 3],
        [4800, 7, 8, 2]
    ]
};

/**
 * Load sample data
 */
function loadSampleData() {
    // Set dimensions
    document.getElementById('numAlternatives').value = sampleData.alternatives.length;
    document.getElementById('numCriteria').value = sampleData.criteria.length;

    // Generate matrix
    generateMatrix();

    // Fill criteria names and types
    sampleData.criteria.forEach((name, i) => {
        const nameInput = document.querySelector(`.criteria-name[data-index="${i}"]`);
        const typeSelect = document.querySelector(`.criteria-type[data-index="${i}"]`);
        if (nameInput) nameInput.value = name;
        if (typeSelect) typeSelect.value = sampleData.types[i];
    });

    // Fill alternative names
    sampleData.alternatives.forEach((name, i) => {
        const input = document.querySelector(`.alt-name[data-index="${i}"]`);
        if (input) input.value = name;
    });

    // Fill matrix values
    populateMatrixInputs('.matrix-cell', sampleData.matrix);

    showAlert('Ornek veriler yuklendi!', 'success');
}

// Document ready
document.addEventListener('DOMContentLoaded', function() {
    initTooltips();

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + Enter to submit
        if (e.ctrlKey && e.key === 'Enter') {
            const analyzeBtn = document.querySelector('button[onclick="runAnalysis()"]');
            if (analyzeBtn) {
                analyzeBtn.click();
            }
        }
    });
});
