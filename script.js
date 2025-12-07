// ============================================
// APP INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Set current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Initialize
    initializeElements();
    initializeEventListeners();
    
    // Generate initial QR code
    setTimeout(generateQRCode, 500);
    
    // Welcome message
    showToast('QR Code Generator Ready!', 'info');
}

// ============================================
// STATE MANAGEMENT
// ============================================

const appState = {
    currentQRCode: null,
    shortUrl: '',
    canvas: null,
    totalGenerated: 0,
    isGenerating: false
};

// ============================================
// DOM ELEMENTS
// ============================================

let elements = {};

function initializeElements() {
    // Core elements only
    elements = {
        // Input elements
        urlInput: document.getElementById('urlInput'),
        generateBtn: document.getElementById('generateBtn'),
        shortenBtn: document.getElementById('shortenBtn'),
        shortUrlText: document.getElementById('shortUrlText'),
        useShortUrlBtn: document.getElementById('useShortUrlBtn'),
        shortResult: document.getElementById('shortResult'),
        
        // Design elements
        qrColor: document.getElementById('qrColor'),
        bgColor: document.getElementById('bgColor'),
        qrColorText: document.getElementById('qrColorText'),
        bgColorText: document.getElementById('bgColorText'),
        qrSize: document.getElementById('qrSize'),
        qrMargin: document.getElementById('qrMargin'),
        sizeValue: document.getElementById('sizeValue'),
        marginValue: document.getElementById('marginValue'),
        errorCorrection: document.getElementById('errorCorrection'),
        
        // Preview elements
        qrContainer: document.getElementById('qrContainer'),
        qrPlaceholder: document.getElementById('qrPlaceholder'),
        qrCanvas: document.getElementById('qrCanvas'),
        previewUrl: document.getElementById('previewUrl'),
        previewSize: document.getElementById('previewSize'),
        
        // Download elements
        downloadPNG: document.getElementById('downloadPNG'),
        downloadSVG: document.getElementById('downloadSVG'),
        
        // Stats elements
        totalGenerated: document.getElementById('totalGenerated'),
        
        // UI elements
        themeToggle: document.getElementById('themeToggle'),
        resetAllBtn: document.getElementById('resetAllBtn'),
        btnLoading: document.getElementById('btnLoading'),
        refreshPreview: document.getElementById('refreshPreview'),
        copyShortBtn: document.getElementById('copyShortBtn')
    };
    
    // Initialize values
    elements.sizeValue.textContent = elements.qrSize.value;
    elements.marginValue.textContent = elements.qrMargin.value;
}

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Color pickers
    elements.qrColor.addEventListener('input', updateColorText);
    elements.bgColor.addEventListener('input', updateColorText);
    elements.qrColorText.addEventListener('input', updateColorPicker);
    elements.bgColorText.addEventListener('input', updateColorPicker);
    
    // Sliders
    elements.qrSize.addEventListener('input', updateSizeValue);
    elements.qrMargin.addEventListener('input', updateMarginValue);
    
    // Main buttons
    elements.generateBtn.addEventListener('click', generateQRCode);
    elements.shortenBtn.addEventListener('click', shortenURL);
    elements.useShortUrlBtn.addEventListener('click', useShortenedURL);
    elements.copyShortBtn.addEventListener('click', copyShortURL);
    
    // Download buttons
    elements.downloadPNG.addEventListener('click', () => downloadQRCode('png'));
    elements.downloadSVG.addEventListener('click', () => downloadQRCode('svg'));
    
    // UI buttons
    elements.resetAllBtn.addEventListener('click', resetAllSettings);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.refreshPreview.addEventListener('click', () => {
        if (elements.urlInput.value.trim()) {
            generateQRCode();
            showToast('Preview refreshed', 'info');
        }
    });
    
    // URL input - Enter key to generate
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateQRCode();
    });
    
    // Auto-generate on design changes
    const designElements = [elements.qrColor, elements.bgColor, elements.errorCorrection, elements.qrSize, elements.qrMargin];
    designElements.forEach(el => {
        el.addEventListener('change', () => {
            if (elements.urlInput.value.trim()) {
                generateQRCode();
            }
        });
    });
}

// ============================================
// CORE FUNCTIONS
// ============================================

async function generateQRCode() {
    const url = elements.urlInput.value.trim();
    
    if (!url) {
        showToast('Please enter a URL', 'error');
        return;
    }
    
    // Process URL
    let processedUrl = url;
    if (!url.startsWith('http')) {
        processedUrl = 'https://' + url;
        elements.urlInput.value = processedUrl;
    }
    
    try {
        // Set loading state
        setLoading(true);
        
        // Clear previous QR code
        elements.qrCanvas.innerHTML = '';
        elements.qrCanvas.classList.remove('visible');
        elements.qrPlaceholder.style.display = 'flex';
        
        // Get settings
        const size = parseInt(elements.qrSize.value);
        const margin = parseInt(elements.qrMargin.value);
        const errorCorrectionLevel = elements.errorCorrection.value;
        
        // Update preview
        elements.previewUrl.textContent = processedUrl;
        elements.previewSize.textContent = `${size}×${size}px`;
        document.getElementById('errorLevel').textContent = errorCorrectionLevel === 'H' ? 'High' : 
                                                           errorCorrectionLevel === 'Q' ? 'Quartile' :
                                                           errorCorrectionLevel === 'M' ? 'Medium' : 'Low';
        
        // Create canvas
        const canvas = document.createElement('canvas');
        elements.qrCanvas.appendChild(canvas);
        
        // Generate QR code
        await QRCode.toCanvas(canvas, processedUrl, {
            width: size,
            margin: margin,
            color: {
                dark: elements.qrColor.value,
                light: elements.bgColor.value
            },
            errorCorrectionLevel: errorCorrectionLevel
        });
        
        // Store reference
        appState.currentQRCode = {
            url: processedUrl,
            canvas: canvas,
            size: size,
            margin: margin
        };
        
        // Update UI
        elements.qrPlaceholder.style.display = 'none';
        elements.qrCanvas.classList.add('visible');
        
        // Enable download buttons
        elements.downloadPNG.disabled = false;
        elements.downloadSVG.disabled = false;
        
        // Update stats
        appState.totalGenerated++;
        elements.totalGenerated.textContent = appState.totalGenerated;
        
        // Show success
        showToast('QR Code generated!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to generate QR code', 'error');
        
        // Show error
        elements.qrPlaceholder.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Generation failed</p>
            <small>Check URL and try again</small>
        `;
    } finally {
        setLoading(false);
    }
}

async function shortenURL() {
    const url = elements.urlInput.value.trim();
    
    if (!url) {
        showToast('Please enter a URL', 'error');
        return;
    }
    
    let processedUrl = url;
    if (!url.startsWith('http')) {
        processedUrl = 'https://' + url;
        elements.urlInput.value = processedUrl;
    }
    
    try {
        elements.shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Shortening...';
        elements.shortenBtn.disabled = true;
        
        // Try is.gd service
        const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(processedUrl)}`);
        
        if (response.ok) {
            const shortened = await response.text();
            if (shortened && !shortened.includes('Error')) {
                appState.shortUrl = shortened;
                elements.shortUrlText.textContent = shortened;
                elements.shortResult.classList.add('visible');
                showToast('URL shortened!', 'success');
            } else {
                throw new Error('Service error');
            }
        } else {
            throw new Error('Network error');
        }
        
    } catch (error) {
        console.error('Shortening error:', error);
        showToast('Could not shorten URL', 'error');
    } finally {
        elements.shortenBtn.innerHTML = '<i class="fas fa-magic"></i> Shorten This URL';
        elements.shortenBtn.disabled = false;
    }
}

function useShortenedURL() {
    if (appState.shortUrl) {
        elements.urlInput.value = appState.shortUrl;
        generateQRCode();
        showToast('Using shortened URL', 'info');
    } else {
        showToast('No shortened URL available', 'error');
    }
}

function copyShortURL() {
    if (appState.shortUrl) {
        navigator.clipboard.writeText(appState.shortUrl)
            .then(() => showToast('Copied to clipboard!', 'success'))
            .catch(() => {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = appState.shortUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('Copied!', 'success');
            });
    } else {
        showToast('No URL to copy', 'error');
    }
}

async function downloadQRCode(format) {
    if (!appState.currentQRCode || !appState.currentQRCode.canvas) {
        showToast('Please generate a QR code first', 'error');
        return;
    }
    
    try {
        let dataUrl, filename;
        
        if (format === 'png') {
            // PNG download
            dataUrl = appState.currentQRCode.canvas.toDataURL('image/png');
            filename = `qr-code-${Date.now()}.png`;
            
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('PNG downloaded!', 'success');
            
        } else if (format === 'svg') {
            // SVG download
            const svgData = await QRCode.toString(appState.currentQRCode.url, {
                type: 'svg',
                width: appState.currentQRCode.size,
                margin: appState.currentQRCode.margin,
                color: {
                    dark: elements.qrColor.value,
                    light: elements.bgColor.value
                }
            });
            
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-code-${Date.now()}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            showToast('SVG downloaded!', 'success');
        }
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed', 'error');
    }
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

function updateColorText() {
    elements.qrColorText.value = elements.qrColor.value;
    elements.bgColorText.value = elements.bgColor.value;
}

function updateColorPicker() {
    const qrColor = validateColor(elements.qrColorText.value);
    const bgColor = validateColor(elements.bgColorText.value);
    
    if (qrColor) {
        elements.qrColor.value = qrColor;
        elements.qrColorText.value = qrColor;
    }
    
    if (bgColor) {
        elements.bgColor.value = bgColor;
        elements.bgColorText.value = bgColor;
    }
    
    // Auto-update QR code if exists
    if (elements.urlInput.value.trim()) {
        generateQRCode();
    }
}

function validateColor(color) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(color)) return color;
    
    try {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = color;
        return ctx.fillStyle;
    } catch {
        return '#3b82f6';
    }
}

function updateSizeValue() {
    elements.sizeValue.textContent = elements.qrSize.value;
}

function updateMarginValue() {
    elements.marginValue.textContent = elements.qrMargin.value;
}

function setLoading(isLoading) {
    appState.isGenerating = isLoading;
    elements.generateBtn.disabled = isLoading;
    
    if (isLoading) {
        elements.btnLoading.style.display = 'flex';
        elements.generateBtn.querySelector('.btn-content').style.opacity = '0.5';
    } else {
        elements.btnLoading.style.display = 'none';
        elements.generateBtn.querySelector('.btn-content').style.opacity = '1';
    }
}

function resetAllSettings() {
    // Reset colors
    elements.qrColor.value = '#3b82f6';
    elements.bgColor.value = '#0f172a';
    elements.qrColorText.value = '#3b82f6';
    elements.bgColorText.value = '#0f172a';
    
    // Reset size
    elements.qrSize.value = '300';
    elements.qrMargin.value = '20';
    
    // Reset error correction
    elements.errorCorrection.value = 'H';
    
    // Update displays
    updateColorText();
    updateSizeValue();
    updateMarginValue();
    
    // Hide short URL result
    elements.shortResult.classList.remove('visible');
    
    // Regenerate if URL exists
    if (elements.urlInput.value.trim()) {
        generateQRCode();
    }
    
    showToast('All settings reset', 'info');
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    // Update toggle button
    const icons = elements.themeToggle.querySelectorAll('i');
    icons[0].style.opacity = newTheme === 'dark' ? '1' : '0';
    icons[1].style.opacity = newTheme === 'light' ? '1' : '0';
    
    // Save preference
    localStorage.setItem('qrStudioTheme', newTheme);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icons for different types
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ============================================
// LOAD SAVED THEME
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('qrStudioTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icons = themeToggle.querySelectorAll('i');
        icons[0].style.opacity = savedTheme === 'dark' ? '1' : '0';
        icons[1].style.opacity = savedTheme === 'light' ? '1' : '0';
    }
});