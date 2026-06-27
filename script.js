// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM элементы
    const numberAInput = document.getElementById('numberA');
    const numberBInput = document.getElementById('numberB');
    const calculationNameInput = document.getElementById('calculationName');
    const calculateBtn = document.getElementById('calculateBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    const percentResult = document.getElementById('percentResult');
    const subtractResult = document.getElementById('subtractResult');
    const addResult = document.getElementById('addResult');
    const differenceResult = document.getElementById('differenceResult');
    const minValue = document.getElementById('minValue');
    const maxValue = document.getElementById('maxValue');
    
    const savedList = document.getElementById('savedList');
    const exportBtn = document.getElementById('exportBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const notification = document.getElementById('notification');
    
    // Текущие результаты расчёта
    let currentResults = null;
    
    // Работа с LocalStorage
    function getSavedCalculations() {
        const saved = localStorage.getItem('calculator_saved');
        return saved ? JSON.parse(saved) : [];
    }
    
    function saveCalculation(calculation) {
        const saved = getSavedCalculations();
        saved.unshift(calculation);
        localStorage.setItem('calculator_saved', JSON.stringify(saved));
    }
    
    function deleteCalculation(id) {
        const saved = getSavedCalculations();
        const filtered = saved.filter(item => item.id !== id);
        localStorage.setItem('calculator_saved', JSON.stringify(filtered));
    }
    
    function clearAllCalculations() {
        localStorage.removeItem('calculator_saved');
    }
    
    // Форматирование чисел
    function formatNumber(num) {
        if (!isFinite(num) || isNaN(num)) return '—';
        
        return new Intl.NumberFormat('ru-RU', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(num);
    }
    
    // Уведомления
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = 'notification';
        if (isError) {
            notification.classList.add('error');
        }
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
    
    // Расчёт
    function calculate() {
        const a = parseFloat(numberAInput.value);
        const b = parseFloat(numberBInput.value);
        
        if (isNaN(a) || isNaN(b)) {
            resetResults();
            return;
        }
        
        const percentValue = (a / b) * 100;
        const subtractPercent = b * (1 - percentValue / 100);
        const addPercent = b * (1 + percentValue / 100);
        const difference = addPercent - subtractPercent;
        
        // Вычисляем мин и макс из пунктов 2 и 3
        const allResults = [subtractPercent, addPercent];
        const min = Math.min(...allResults);
        const max = Math.max(...allResults);
        
        percentResult.textContent = formatNumber(percentValue) + '%';
        subtractResult.textContent = formatNumber(subtractPercent);
        addResult.textContent = formatNumber(addPercent);
        differenceResult.textContent = formatNumber(difference);
        minValue.textContent = formatNumber(min);
        maxValue.textContent = formatNumber(max);
        
        highlightMinMax(allResults, min, max);
        
        // Сохраняем текущие результаты вместе с мин/макс
        currentResults = {
            a: a,
            b: b,
            percentValue: percentValue,
            subtractPercent: subtractPercent,
            addPercent: addPercent,
            difference: difference,
            min: min,
            max: max
        };
        
        calculateBtn.classList.add('active');
        setTimeout(() => {
            calculateBtn.classList.remove('active');
        }, 150);
    }
    
    function resetResults() {
        percentResult.textContent = '—';
        subtractResult.textContent = '—';
        addResult.textContent = '—';
        differenceResult.textContent = '—';
        minValue.textContent = '—';
        maxValue.textContent = '—';
        resetHighlights();
        currentResults = null;
    }
    
    function highlightMinMax(results, min, max) {
        const resultCards = document.querySelectorAll('.result-card');
        
        resultCards.forEach((card, index) => {
            if (index > 0 && index < 3) {
                card.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                card.style.boxShadow = 'none';
            }
        });
        
        const numericCardIndices = [1, 2];
        
        numericCardIndices.forEach((cardIndex) => {
            const resultIndex = cardIndex - 1;
            const numValue = results[resultIndex];
            const card = resultCards[cardIndex];
            
            if (numValue === min && numValue === max) {
                card.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                card.style.boxShadow = '0 0 15px rgba(251, 191, 36, 0.2)';
            } else if (numValue === min) {
                card.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                card.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.2)';
            } else if (numValue === max) {
                card.style.borderColor = 'rgba(34, 197, 94, 0.6)';
                card.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.2)';
            }
        });
    }
    
    function resetHighlights() {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach(card => {
            card.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            card.style.boxShadow = 'none';
        });
    }
    
    // Сохранение расчёта
    function saveCurrentCalculation() {
        if (!currentResults) {
            showNotification('Сначала выполните расчёт!', true);
            return;
        }
        
        const name = calculationNameInput.value.trim() || 'Без названия';
        
        const calculation = {
            id: Date.now(),
            name: name,
            date: new Date().toLocaleString('ru-RU'),
            numberA: currentResults.a,
            numberB: currentResults.b,
            percentValue: currentResults.percentValue,
            subtractPercent: currentResults.subtractPercent,
            addPercent: currentResults.addPercent,
            difference: currentResults.difference,
            min: currentResults.min,
            max: currentResults.max
        };
        
        saveCalculation(calculation);
        showNotification('Расчёт сохранён!');
        calculationNameInput.value = '';
    }
    
    // Отображение сохранений
    function renderSavedList() {
        const saved = getSavedCalculations();
        
        if (saved.length === 0) {
            savedList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Нет сохранений</p>
                </div>
            `;
            return;
        }
        
        savedList.innerHTML = saved.map(item => `
            <div class="saved-item" data-id="${item.id}">
                <div class="saved-item-header">
                    <div>
                        <div class="saved-item-name">${item.name}</div>
                        <div class="saved-item-date">${item.date}</div>
                    </div>
                    <button class="saved-item-delete" onclick="deleteItem(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="saved-item-values">
                    <div class="saved-item-value">
                        <span class="saved-item-label">Числа</span>
                        <span class="saved-item-number">А: ${formatNumber(item.numberA)} / Б: ${formatNumber(item.numberB)}</span>
                    </div>
                    <div class="saved-item-value">
                        <span class="saved-item-label">Процент</span>
                        <span class="saved-item-number">${formatNumber(item.percentValue)}%</span>
                    </div>
                    <div class="saved-item-value">
                        <span class="saved-item-label">Б - %</span>
                        <span class="saved-item-number">${formatNumber(item.subtractPercent)}</span>
                    </div>
                    <div class="saved-item-value">
                        <span class="saved-item-label">Б + %</span>
                        <span class="saved-item-number">${formatNumber(item.addPercent)}</span>
                    </div>
                    <div class="saved-item-value">
                        <span class="saved-item-label">Разница</span>
                        <span class="saved-item-number">${formatNumber(item.difference)}</span>
                    </div>
                    <div class="saved-item-value">
                        <span class="saved-item-label">Минимум</span>
                        <span class="saved-item-number" style="color: #ef4444;">${formatNumber(item.min)}</span>
                    </div>
                    <div class="saved-item-value">
                        <span class="saved-item-label">Максимум</span>
                        <span class="saved-item-number" style="color: #22c55e;">${formatNumber(item.max)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Удаление элемента
    window.deleteItem = function(id) {
        if (confirm('Удалить этот расчёт?')) {
            deleteCalculation(id);
            renderSavedList();
            showNotification('Расчёт удалён');
        }
    };
    
    // Экспорт в текстовый файл
    function exportToText() {
        const saved = getSavedCalculations();
        
        if (saved.length === 0) {
            showNotification('Нечего выгружать!', true);
            return;
        }
        
        let text = 'ЭКСПОРТ РАСЧЁТОВ КАЛЬКУЛЯТОРА\n';
        text += '='.repeat(50) + '\n\n';
        
        saved.forEach((item, index) => {
            text += `РАСЧЁТ #${index + 1}: ${item.name}\n`;
            text += `Дата: ${item.date}\n`;
            text += '-'.repeat(30) + '\n';
            text += `Число А: ${formatNumber(item.numberA)}\n`;
            text += `Число Б: ${formatNumber(item.numberB)}\n`;
            text += `Процент А от Б: ${formatNumber(item.percentValue)}%\n`;
            text += `Б минус процент: ${formatNumber(item.subtractPercent)}\n`;
            text += `Б плюс процент: ${formatNumber(item.addPercent)}\n`;
            text += `Разница: ${formatNumber(item.difference)}\n`;
            text += `Минимум (из Б-/+%): ${formatNumber(item.min)}\n`;
            text += `Максимум (из Б-/+%): ${formatNumber(item.max)}\n`;
            text += '\n' + '='.repeat(50) + '\n\n';
        });
        
        // Создаём файл и скачиваем
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `calculations_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('Файл выгружен!');
    }
    
    // Переключение вкладок
    function switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if (tabName === 'calculator') {
            document.querySelector('[data-tab="calculator"]').classList.add('active');
            document.getElementById('calculatorTab').classList.add('active');
        } else if (tabName === 'saved') {
            document.querySelector('[data-tab="saved"]').classList.add('active');
            document.getElementById('savedTab').classList.add('active');
            renderSavedList();
        }
    }
    
    // Обработчики событий
    calculateBtn.addEventListener('click', calculate);
    saveBtn.addEventListener('click', saveCurrentCalculation);
    exportBtn.addEventListener('click', exportToText);
    
    clearAllBtn.addEventListener('click', function() {
        if (confirm('Удалить ВСЕ сохранения?')) {
            clearAllCalculations();
            renderSavedList();
            showNotification('Все сохранения удалены');
        }
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Дебаунс для авторасчёта
    let debounceTimer;
    function debounceCalculate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(calculate, 400);
    }
    
    numberAInput.addEventListener('input', debounceCalculate);
    numberBInput.addEventListener('input', debounceCalculate);
    
    numberAInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculate();
        }
    });
    
    numberBInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculate();
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (e.target.tagName === 'INPUT') {
            return;
        }
    }, { passive: true });
    
    // Инициализация
    numberAInput.setAttribute('placeholder', ' ');
    numberBInput.setAttribute('placeholder', ' ');
    calculationNameInput.setAttribute('placeholder', ' ');
    renderSavedList();
});