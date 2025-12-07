// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Get all DOM elements
    const elements = {
        urlInput: document.getElementById('urlInput'),
        generateBtn: document.getElementById('generateBtn'),
        shortenBtn: document.getElementById('shortenBtn'),
        shortUrl: document.getElementById('shortUrl'),
        useShortUrlBtn: document.getElementById('useShortUrlBtn'),
        shortenSection: document.getElementById('shortenSection'),
        qrColor: document.getElementById('qrColor'),
        bgColor: document.getElementById('bgColor'),
        qrColorText: document.getElementById('qrColorText'),
        bgColorText: document.getElementById('bgColorText'),
        qrSize: document.getElementById('qrSize'),
        qrMargin: document.getElementById('qrMargin'),
        sizeValue: document.getElementById('sizeValue'),
        marginValue: document.getElementById('marginValue'),
        downloadPNG: document.getElementById('downloadPNG'),
        downloadSVG: document.getElementById('downloadSVG'),
        qrcodeDiv: document.getElementById('qrcode')
    };

    // State
    let currentQRCode = null;
    let shortUrlText = '';
    let canvas = null;

    // Initialize slider values
    elements.sizeValue.textContent = elements.qrSize.value;
    elements.marginValue.textContent = elements.qrMargin.value;

    // Update color text when color picker changes
    elements.qrColor.addEventListener('input', () => {
        elements.qrColorText.value = elements.qrColor.value;
    });
    
    elements.bgColor.addEventListener('input', () => {
        elements.bgColorText.value = elements.bgColor.value;
    });

    // Update color picker when text changes
    elements.qrColorText.addEventListener('input', () => {
        elements.qrColor.value = elements.qrColorText.value;
    });
    
    elements.bgColorText.addEventListener('input', () => {
        elements.bgColor.value = elements.bgColorText.value;
    });

    // Update slider value displays
    elements.qrSize.addEventListener('input', () => {
        elements.sizeValue.textContent = elements.qrSize.value;
    });

    elements.qrMargin.addEventListener('input', () => {
        elements.marginValue.textContent = elements.qrMargin.value;
    });

    // Generate QR Code
    elements.generateBtn.addEventListener('click', generateQRCode);

    // Generate QR Code function
    async function generateQRCode() {
        const url = elements.urlInput.value.trim();
        
        // Basic URL validation
        if (!url) {
            showMessage('Please enter a URL', 'error');
            return;
        }
        
        // Add https:// if missing
        let processedUrl = url;
        if (!url.startsWith('http')) {
            processedUrl = 'https://' + url;
            elements.urlInput.value = processedUrl;
        }

        try {
            // Show loading state
            elements.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            elements.generateBtn.disabled = true;

            // Clear previous QR code
            elements.qrcodeDiv.innerHTML = '';

            // Create canvas for QR code
            canvas = document.createElement('canvas');
            elements.qrcodeDiv.appendChild(canvas);

            // QR Code options
            const size = parseInt(elements.qrSize.value);
            const margin = parseInt(elements.qrMargin.value);

            // Generate QR code
            await QRCode.toCanvas(canvas, processedUrl, {
                width: size,
                margin: margin,
                color: {
                    dark: elements.qrColor.value,
                    light: elements.bgColor.value
                }
            });

            // Store current QR code data
            currentQRCode = {
                url: processedUrl,
                canvas: canvas,
                size: size
            };

            // Enable download buttons
            elements.downloadPNG.disabled = false;
            elements.downloadSVG.disabled = false;

            showMessage('QR Code generated successfully!', 'success');

        } catch (error) {
            console.error('Error generating QR code:', error);
            showMessage('Failed to generate QR code. Please try again.', 'error');
            
            // Show error placeholder
            elements.qrcodeDiv.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Something went wrong</p>
                    <small>Please check your URL and try again</small>
                </div>
            `;
        } finally {
            // Reset button state
            elements.generateBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate QR Code';
            elements.generateBtn.disabled = false;
        }
    }

    // Shorten URL
    elements.shortenBtn.addEventListener('click', async function() {
        const url = elements.urlInput.value.trim();
        
        if (!url) {
            showMessage('Please enter a URL first', 'error');
            return;
        }

        // Show loading state
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Shortening...';
        this.disabled = true;

        try {
            // Use is.gd service (simple and free)
            const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
            
            if (!response.ok) {
                throw new Error('Shortening service failed');
            }

            shortUrlText = await response.text();
            
            // Show the shortened URL
            elements.shortUrl.textContent = shortUrlText;
            elements.shortenSection.classList.remove('hidden');
            elements.shortenSection.classList.add('show', 'fade-in');

            // Add click to copy functionality
            elements.shortUrl.style.cursor = 'pointer';
            elements.shortUrl.title = 'Click to copy';
            
            elements.shortUrl.addEventListener('click', function() {
                navigator.clipboard.writeText(shortUrlText)
                    .then(() => {
                        const original = this.textContent;
                        this.textContent = 'Copied! ✓';
                        this.style.color = '#10b981';
                        this.style.fontWeight = 'bold';
                        
                        setTimeout(() => {
                            this.textContent = original;
                            this.style.color = '';
                            this.style.fontWeight = '';
                        }, 2000);
                    });
            });

            showMessage('URL shortened successfully!', 'success');

        } catch (error) {
            console.error('URL shortening error:', error);
            showMessage('Could not shorten URL. Please try again later.', 'error');
        } finally {
            // Reset button
            this.innerHTML = originalText;
            this.disabled = false;
        }
    });

    // Use shortened URL
    elements.useShortUrlBtn.addEventListener('click', function() {
        if (shortUrlText) {
            elements.urlInput.value = shortUrlText;
            generateQRCode();
            showMessage('Using shortened URL', 'info');
        } else {
            showMessage('Please shorten a URL first', 'error');
        }
    });

    // Download PNG
    elements.downloadPNG.addEventListener('click', function() {
        if (!currentQRCode || !canvas) {
            showMessage('Please generate a QR code first', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showMessage('QR code downloaded as PNG', 'success');
    });

    // Download SVG
    elements.downloadSVG.addEventListener('click', async function() {
        if (!currentQRCode) {
            showMessage('Please generate a QR code first', 'error');
            return;
        }

        try {
            // Show loading
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating SVG...';
            this.disabled = true;

            // Generate SVG
            const svgData = await QRCode.toString(currentQRCode.url, {
                type: 'svg',
                width: currentQRCode.size,
                margin: parseInt(elements.qrMargin.value),
                color: {
                    dark: elements.qrColor.value,
                    light: elements.bgColor.value
                }
            });

            // Create download link
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.svg`;
            link.href = url;
            link.click();

            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            showMessage('QR code downloaded as SVG', 'success');

        } catch (error) {
            console.error('SVG download error:', error);
            showMessage('Failed to create SVG. Download PNG instead.', 'error');
        } finally {
            // Reset button
            this.innerHTML = '<i class="fas fa-download"></i> Download SVG';
            this.disabled = false;
        }
    });

    // Auto-generate when customization changes
    [elements.qrColor, elements.bgColor, elements.qrSize, elements.qrMargin].forEach(element => {
        element.addEventListener('change', () => {
            if (elements.urlInput.value.trim()) {
                generateQRCode();
            }
        });
    });

    // Generate QR code when pressing Enter in URL input
    elements.urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });

    // Simple message display function
    function showMessage(text, type = 'info') {
        // Create message element
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        // Set color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        message.style.background = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 3000);
    }

    // Generate initial QR code
    setTimeout(() => {
        generateQRCode();
    }, 500);
});