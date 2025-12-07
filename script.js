// ============================================
// APP INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
});

function initApp() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Initialize all components
    initializeElements();
    initializeEventListeners();
    initializeState();
    
    // Generate initial QR code
    setTimeout(generateQRCode, 500);
    
    // Show welcome message
    showToast('Welcome to QRStudio! 🎨', 'info');
}

// ============================================
// STATE MANAGEMENT
// ============================================

const appState = {
    currentQRCode: null,
    shortUrl: '',
    canvas: null,
    totalGenerated: 0,
    logoImage: null,
    zoomLevel: 100,
    currentFormat: 'png',
    isGenerating: false,
    lastGenerated: 'Never'
};

// ============================================
// DOM ELEMENTS
// ============================================

let elements = {};

function initializeElements() {
    // Core elements
    elements = {
        // Input elements
        urlInput: document.getElementById('urlInput'),
        generateBtn: document.getElementById('generateBtn'),
        shortenBtn: document.getElementById('shortenBtn'),
        shortUrlText: document.getElementById('shortUrlText'),
        useShortUrlBtn: document.getElementById('useShortUrlBtn'),
        shortResult: document.getElementById('shortResult'),
        shortenOptions: document.getElementById('shortenOptions'),
        
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
        enableShortening: document.getElementById('enableShortening'),
        
        // Preview elements
        qrContainer: document.getElementById('qrContainer'),
        qrPlaceholder: document.getElementById('qrPlaceholder'),
        qrCanvas: document.getElementById('qrCanvas'),
        previewUrl: document.getElementById('previewUrl'),
        previewSize: document.getElementById('previewSize'),
        
        // Download elements
        downloadPNG: document.getElementById('downloadPNG'),
        downloadSVG: document.getElementById('downloadSVG'),
        includeLogo: document.getElementById('includeLogo'),
        transparentBg: document.getElementById('transparentBg'),
        
        // Stats elements
        totalGenerated: document.getElementById('totalGenerated'),
        totalCodes: document.getElementById('totalCodes'),
        lastGenerated: document.getElementById('lastGenerated'),
        
        // UI elements
        themeToggle: document.getElementById('themeToggle'),
        resetBtn: document.getElementById('resetBtn'),
        saveBtn: document.getElementById('saveBtn'),
        btnLoading: document.getElementById('btnLoading'),
        
        // Zoom elements
        zoomOut: document.getElementById('zoomOut'),
        zoomIn: document.getElementById('zoomIn'),
        zoomLevel: document.getElementById('zoomLevel'),
        zoomSlider: document.getElementById('zoomSlider'),
        
        // Quick links
        quickLinks: document.querySelectorAll('.quick-link'),
        
        // Format options
        formatOptions: document.querySelectorAll('.format-option'),
        
        // Size presets
        sizeBtns: document.querySelectorAll('.size-btn'),
        
        // Copy and test buttons
        copyShortBtn: document.getElementById('copyShortBtn'),
        testShortBtn: document.getElementById('testShortBtn'),
        
        // Upload area
        uploadArea: document.getElementById('uploadArea'),
        logoUpload: document.getElementById('logoUpload')
    };
    
    // Initialize values
    elements.sizeValue.textContent = elements.qrSize.value;
    elements.marginValue.textContent = elements.qrMargin.value;
    elements.zoomLevel.textContent = `${appState.zoomLevel}%`;
    elements.zoomSlider.value = appState.zoomLevel;
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
    elements.zoomSlider.addEventListener('input', updateZoomLevel);
    
    // Main buttons
    elements.generateBtn.addEventListener('click', generateQRCode);
    elements.shortenBtn.addEventListener('click', shortenURL);
    elements.useShortUrlBtn.addEventListener('click', useShortenedURL);
    
    // Download buttons
    elements.downloadPNG.addEventListener('click', () => downloadQRCode('png'));
    elements.downloadSVG.addEventListener('click', () => downloadQRCode('svg'));
    
    // URL input
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateQRCode();
    });
    
    // UI buttons
    elements.resetBtn.addEventListener('click', resetSettings);
    elements.saveBtn.addEventListener('click', savePreset);
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Zoom controls
    elements.zoomOut.addEventListener('click', zoomOut);
    elements.zoomIn.addEventListener('click', zoomIn);
    
    // Quick links
    elements.quickLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const url = e.currentTarget.getAttribute('data-url');
            elements.urlInput.value = url;
            generateQRCode();
        });
    });
    
    // Format options
    elements.formatOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            // Remove active class from all
            elements.formatOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked
            e.currentTarget.classList.add('active');
            appState.currentFormat = e.currentTarget.getAttribute('data-format');
        });
    });
    
    // Size presets
    elements.sizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            elements.sizeBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            e.currentTarget.classList.add('active');
            const size = e.currentTarget.getAttribute('data-size');
            elements.qrSize.value = size;
            updateSizeValue();
            generateQRCode();
        });
    });
    
    // URL shortening toggle
    elements.enableShortening.addEventListener('change', toggleShortening);
    
    // Copy and test short URL
    if (elements.copyShortBtn) {
        elements.copyShortBtn.addEventListener('click', copyShortURL);
    }
    if (elements.testShortBtn) {
        elements.testShortBtn.addEventListener('click', testShortURL);
    }
    
    // Logo upload
    if (elements.uploadArea) {
        elements.uploadArea.addEventListener('click', () => elements.logoUpload.click());
        elements.logoUpload.addEventListener('change', handleLogoUpload);
    }
    
    // Auto-generate on design changes
    const designElements = [elements.qrColor, elements.bgColor, elements.errorCorrection];
    designElements.forEach(el => {
        el.addEventListener('change', () => {
            if (elements.urlInput.value.trim()) {
                generateQRCode();
            }
        });
    });
}

// ============================================
// INITIALIZE STATE
// ============================================

function initializeState() {
    // Load saved state from localStorage
    const savedState = localStorage.getItem('qrStudioState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            // Apply saved settings
            if (state.qrColor) {
                elements.qrColor.value = state.qrColor;
                elements.qrColorText.value = state.qrColor;
            }
            if (state.bgColor) {
                elements.bgColor.value = state.bgColor;
                elements.bgColorText.value = state.bgColor;
            }
            if (state.totalGenerated) {
                appState.totalGenerated = state.totalGenerated;
                updateStats();
            }
        } catch (e) {
            console.log('Could not load saved state');
        }
    }
}

// ============================================
// QR CODE GENERATION
// ============================================

async function generateQRCode() {
    const url = elements.urlInput.value.trim();
    
    // Validate URL
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
        const margin = parseInt(elements.margin.value);
        const errorCorrectionLevel = elements.errorCorrection.value;
        
        // Update preview
        elements.previewUrl.textContent = processedUrl;
        elements.previewSize.textContent = `${size}×${size}px`;
        
        // Create canvas for QR code
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
            margin: margin,
            color: {
                dark: elements.qrColor.value,
                light: elements.bgColor.value
            },
            errorCorrectionLevel: errorCorrectionLevel
        };
        
        // Update UI
        elements.qrPlaceholder.style.display = 'none';
        elements.qrCanvas.classList.add('visible');
        
        // Enable download buttons
        elements.downloadPNG.disabled = false;
        elements.downloadSVG.disabled = false;
        
        // Update stats
        appState.totalGenerated++;
        appState.lastGenerated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        updateStats();
        
        // Save state
        saveState();
        
        // Show success message
        showToast('QR Code generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        showToast('Failed to generate QR code. Please check your URL.', 'error');
        
        // Show error in preview
        elements.qrPlaceholder.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Generation failed</p>
            <small>Please check your URL and try again</small>
        `;
    } finally {
        // Reset loading state
        setLoading(false);
    }
}

// ============================================
// URL SHORTENING
// ============================================

async function shortenURL() {
    const url = elements.urlInput.value.trim();
    
    if (!url) {
        showToast('Please enter a URL first', 'error');
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
        const originalText = elements.shortenBtn.innerHTML;
        elements.shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Shortening...';
        elements.shortenBtn.disabled = true;
        
        // Try multiple shortening services
        const shortened = await tryShorteningServices(processedUrl);
        
        if (shortened) {
            appState.shortUrl = shortened;
            elements.shortUrlText.textContent = shortened;
            elements.shortResult.classList.add('visible');
            
            showToast('URL shortened successfully!', 'success');
        } else {
            throw new Error('All services failed');
        }
        
    } catch (error) {
        console.error('URL shortening error:', error);
        showToast('Could not shorten URL. Please try again.', 'error');
    } finally {
        // Reset button
        elements.shortenBtn.innerHTML = '<i class="fas fa-magic"></i> Shorten';
        elements.shortenBtn.disabled = false;
    }
}

async function tryShorteningServices(url) {
    const services = [
        // Service 1: is.gd
        async () => {
            try {
                const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
                if (response.ok) {
                    const text = await response.text();
                    if (text && !text.includes('Error')) return text;
                }
            } catch (e) {}
            return null;
        },
        // Service 2: v.gd (fallback)
        async () => {
            try {
                const response = await fetch(`https://v.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
                if (response.ok) {
                    return await response.text();
                }
            } catch (e) {}
            return null;
        }
    ];
    
    // Try each service
    for (const service of services) {
        try {
            const result = await service();
            if (result) return result;
        } catch (e) {}
    }
    
    return null;
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
            .then(() => {
                showToast('Copied to clipboard!', 'success');
            })
            .catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = appState.shortUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('Copied to clipboard!', 'success');
            });
    }
}

function testShortURL() {
    if (appState.shortUrl) {
        window.open(appState.shortUrl, '_blank');
    }
}

// ============================================
// DOWNLOAD FUNCTIONS
// ============================================

async function downloadQRCode(format) {
    if (!appState.currentQRCode || !appState.currentQRCode.canvas) {
        showToast('Please generate a QR code first', 'error');
        return;
    }
    
    try {
        let dataUrl, filename, mimeType;
        
        if (format === 'png') {
            // For PNG
            const canvas = await addLogoToQR(appState.currentQRCode.canvas);
            dataUrl = canvas.toDataURL('image/png');
            filename = `qr-code-${Date.now()}.png`;
            mimeType = 'image/png';
            
        } else if (format === 'svg') {
            // For SVG
            const svgData = await QRCode.toString(appState.currentQRCode.url, {
                type: 'svg',
                width: appState.currentQRCode.size,
                margin: appState.currentQRCode.margin,
                color: appState.currentQRCode.color,
                errorCorrectionLevel: appState.currentQRCode.errorCorrectionLevel
            });
            
            // Convert to data URL
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const reader = new FileReader();
            
            dataUrl = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(blob);
            });
            
            filename = `qr-code-${Date.now()}.svg`;
            mimeType = 'image/svg+xml';
            
        } else {
            showToast('Format not supported yet', 'warning');
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`${format.toUpperCase()} downloaded successfully!`, 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to download QR code', 'error');
    }
}

async function addLogoToQR(qrCanvas) {
    if (!elements.includeLogo.checked || !appState.logoImage) {
        return qrCanvas;
    }
    
    const logoSize = Math.min(qrCanvas.width, qrCanvas.height) * 0.2; // 20% of QR size
    
    // Create a new canvas with logo
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = qrCanvas.width;
    finalCanvas.height = qrCanvas.height;
    const ctx = finalCanvas.getContext('2d');
    
    // Draw QR code
    ctx.drawImage(qrCanvas, 0, 0);
    
    // Draw logo in center
    const logoX = (qrCanvas.width - logoSize) / 2;
    const logoY = (qrCanvas.height - logoSize) / 2;
    
    // Create circular mask for logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Draw logo
    ctx.drawImage(appState.logoImage, logoX, logoY, logoSize, logoSize);
    ctx.restore();
    
    // Add white border around logo
    ctx.beginPath();
    ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    return finalCanvas;
}

// ============================================
// UI CONTROLS
// ============================================

function updateColorText() {
    elements.qrColorText.value = elements.qrColor.value;
    elements.bgColorText.value = elements.bgColor.value;
}

function updateColorPicker() {
    // Validate color format
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
}

function validateColor(color) {
    // Check if it's a valid hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(color)) {
        return color;
    }
    
    // Try to convert other formats to hex
    try {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = color;
        return ctx.fillStyle;
    } catch (e) {
        return '#3b82f6'; // Default blue
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

function toggleShortening() {
    if (elements.enableShortening.checked) {
        elements.shortenOptions.classList.add('visible');
    } else {
        elements.shortenOptions.classList.remove('visible');
        elements.shortResult.classList.remove('visible');
    }
}

function zoomOut() {
    if (appState.zoomLevel > 50) {
        appState.zoomLevel -= 10;
        updateZoomDisplay();
    }
}

function zoomIn() {
    if (appState.zoomLevel < 200) {
        appState.zoomLevel += 10;
        updateZoomDisplay();
    }
}

function updateZoomLevel() {
    appState.zoomLevel = parseInt(elements.zoomSlider.value);
    updateZoomDisplay();
}

function updateZoomDisplay() {
    elements.zoomLevel.textContent = `${appState.zoomLevel}%`;
    elements.zoomSlider.value = appState.zoomLevel;
    
    // Apply zoom to QR canvas if it exists
    if (appState.currentQRCode && appState.currentQRCode.canvas) {
        const scale = appState.zoomLevel / 100;
        appState.currentQRCode.canvas.style.transform = `scale(${scale})`;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function updateStats() {
    if (elements.totalGenerated) {
        elements.totalGenerated.textContent = appState.totalGenerated;
    }
    if (elements.totalCodes) {
        elements.totalCodes.textContent = appState.totalGenerated;
    }
    if (elements.lastGenerated) {
        elements.lastGenerated.textContent = appState.lastGenerated;
    }
}

function saveState() {
    const state = {
        qrColor: elements.qrColor.value,
        bgColor: elements.bgColor.value,
        totalGenerated: appState.totalGenerated
    };
    localStorage.setItem('qrStudioState', JSON.stringify(state));
}

function resetSettings() {
    // Reset to defaults
    elements.qrColor.value = '#3b82f6';
    elements.bgColor.value = '#0f172a';
    elements.qrColorText.value = '#3b82f6';
    elements.bgColorText.value = '#0f172a';
    elements.qrSize.value = '300';
    elements.qrMargin.value = '20';
    elements.errorCorrection.value = 'H';
    elements.enableShortening.checked = false;
    
    // Update displays
    updateColorText();
    updateSizeValue();
    updateMarginValue();
    toggleShortening();
    
    // Remove logo
    appState.logoImage = null;
    if (elements.uploadArea) {
        elements.uploadArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drop logo image or <span>browse</span></p>
            <input type="file" id="logoUpload" accept="image/*">
        `;
    }
    
    // Generate with new settings if URL exists
    if (elements.urlInput.value.trim()) {
        generateQRCode();
    }
    
    showToast('Settings reset to defaults', 'info');
}

function savePreset() {
    const preset = {
        name: `Preset ${new Date().toLocaleTimeString()}`,
        qrColor: elements.qrColor.value,
        bgColor: elements.bgColor.value,
        size: elements.qrSize.value,
        margin: elements.qrMargin.value,
        errorCorrection: elements.errorCorrection.value
    };
    
    // Get existing presets
    let presets = JSON.parse(localStorage.getItem('qrStudioPresets') || '[]');
    presets.push(preset);
    
    // Save (keep only last 10)
    if (presets.length > 10) {
        presets = presets.slice(-10);
    }
    
    localStorage.setItem('qrStudioPresets', JSON.stringify(presets));
    showToast('Preset saved successfully!', 'success');
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    // Update toggle button icon
    const icons = elements.themeToggle.querySelectorAll('i');
    icons[0].style.opacity = newTheme === 'dark' ? '1' : '0';
    icons[1].style.opacity = newTheme === 'light' ? '1' : '0';
    
    // Save theme preference
    localStorage.setItem('qrStudioTheme', newTheme);
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Image size should be less than 5MB', 'error');
        return;
    }
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            appState.logoImage = img;
            
            // Update upload area
            elements.uploadArea.innerHTML = `
                <div class="logo-preview">
                    <img src="${e.target.result}" alt="Logo">
                    <button class="remove-logo" title="Remove logo">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p>${file.name}</p>
            `;
            
            // Add remove button listener
            const removeBtn = elements.uploadArea.querySelector('.remove-logo');
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                appState.logoImage = null;
                elements.uploadArea.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drop logo image or <span>browse</span></p>
                    <input type="file" id="logoUpload" accept="image/*">
                `;
                // Re-attach event listeners
                const newUpload = elements.uploadArea.querySelector('#logoUpload');
                newUpload.addEventListener('change', handleLogoUpload);
            });
            
            showToast('Logo uploaded successfully!', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
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

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// ============================================
// LOAD SAVED THEME
// ============================================

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('qrStudioTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Update toggle button
    const icons = elements.themeToggle?.querySelectorAll('i');
    if (icons) {
        icons[0].style.opacity = savedTheme === 'dark' ? '1' : '0';
        icons[1].style.opacity = savedTheme === 'light' ? '1' : '0';
    }
}

// Load theme when DOM is ready
document.addEventListener('DOMContentLoaded', loadSavedTheme);