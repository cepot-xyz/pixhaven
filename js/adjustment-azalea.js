// ===== IMAGE ADJUSTMENT EDITOR - AZALEA =====

class AdjustmentEditorAzalea {
    constructor() {
        // Canvas & Image
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.fileInput = document.getElementById('fileInput');
        this.uploadHint = document.getElementById('uploadHint');
        this.canvasWrapper = document.getElementById('canvasWrapper');

        // Buttons
        this.loadConfigBtn = document.querySelector('.btn-load');
        this.saveConfigBtn = document.querySelector('.btn-save');
        this.exportBtn = document.querySelector('.btn-export');

        // Sliders
        this.sliders = {
            exposure: {
                slider: document.getElementById('exposureSlider'),
                input: document.getElementById('exposureValue')
            },
            contrast: {
                slider: document.getElementById('contrastSlider'),
                input: document.getElementById('contrastValue')
            },
            saturation: {
                slider: document.getElementById('saturationSlider'),
                input: document.getElementById('saturationValue')
            },
            tint: {
                slider: document.getElementById('tintSlider'),
                input: document.getElementById('tintValue')
            },
            temperature: {
                slider: document.getElementById('temperatureSlider'),
                input: document.getElementById('temperatureValue')
            },
            sharpen: {
                slider: document.getElementById('sharpenSlider'),
                input: document.getElementById('sharpenValue')
            },
            highlight: {
                slider: document.getElementById('highlightSlider'),
                input: document.getElementById('highlightValue')
            },
            shadow: {
                slider: document.getElementById('shadowSlider'),
                input: document.getElementById('shadowValue')
            },
            black: {
                slider: document.getElementById('blackSlider'),
                input: document.getElementById('blackValue')
            },
            white: {
                slider: document.getElementById('whiteSlider'),
                input: document.getElementById('whiteValue')
            }
        };

        // Current image data
        this.originalImageData = null;
        this.currentImage = null;

        this.init();
        this.loadDefaultImage();
    }

    init() {
        this.bindEvents();
    }

    loadDefaultImage() {
        const img = new Image();
        img.src = 'assets/images/Elegance Azalea.png';
        img.onload = () => {
            const maxWidth = this.canvasWrapper.offsetWidth;
            const maxHeight = this.canvasWrapper.offsetHeight - 80;

            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            this.canvas.width = width;
            this.canvas.height = height;

            this.ctx.drawImage(img, 0, 0, width, height);
            this.currentImage = img;
            this.originalImageData = this.ctx.getImageData(0, 0, width, height);

            // Hide upload hint
            this.uploadHint.style.display = 'none';
            this.canvasWrapper.classList.add('has-image');
        };
    }

    bindEvents() {
        // File upload
        this.uploadHint.addEventListener('click', () => this.fileInput.click());
        this.uploadHint.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadHint.style.backgroundColor = '#f0f0f0';
        });
        this.uploadHint.addEventListener('dragleave', () => {
            this.uploadHint.style.backgroundColor = 'transparent';
        });
        this.uploadHint.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadHint.style.backgroundColor = 'transparent';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.loadImage(file);
            }
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadImage(e.target.files[0]);
            }
        });

        // Slider bindings
        Object.entries(this.sliders).forEach(([key, { slider, input }]) => {
            slider.addEventListener('input', () => {
                input.value = slider.value;
                this.applyAdjustments();
            });

            input.addEventListener('input', () => {
                const val = Math.max(slider.min, Math.min(slider.max, input.value));
                slider.value = val;
                input.value = val;
                this.applyAdjustments();
            });
        });

        // Button handlers
        this.loadConfigBtn.addEventListener('click', () => this.showLoadConfigModal());
        this.saveConfigBtn.addEventListener('click', () => this.showSaveConfigModal());
        this.exportBtn.addEventListener('click', () => this.exportImage());

        // Modal elements
        const saveConfigModal = document.getElementById('saveConfigModal');
        const loadConfigModal = document.getElementById('loadConfigModal');
        const configNameInput = document.getElementById('configNameInput');
        const confirmSaveBtn = document.getElementById('confirmSaveConfigBtn');
        const cancelSaveBtn = document.getElementById('cancelSaveConfigBtn');
        const cancelLoadBtn = document.getElementById('cancelLoadConfigBtn');

        // Save config modal
        confirmSaveBtn.addEventListener('click', () => {
            const name = configNameInput.value.trim();
            if (name) {
                this.saveConfigWithName(name);
                saveConfigModal.classList.remove('show');
                configNameInput.value = '';
            } else {
                alert('Silakan masukkan nama konfigurasi');
            }
        });

        cancelSaveBtn.addEventListener('click', () => {
            saveConfigModal.classList.remove('show');
            configNameInput.value = '';
        });

        // Close modal when clicking outside
        saveConfigModal.addEventListener('click', (e) => {
            if (e.target === saveConfigModal) {
                saveConfigModal.classList.remove('show');
                configNameInput.value = '';
            }
        });

        // Load config modal
        cancelLoadBtn.addEventListener('click', () => {
            loadConfigModal.classList.remove('show');
        });

        loadConfigModal.addEventListener('click', (e) => {
            if (e.target === loadConfigModal) {
                loadConfigModal.classList.remove('show');
            }
        });
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Set canvas size
                const maxWidth = this.canvasWrapper.offsetWidth;
                const maxHeight = this.canvasWrapper.offsetHeight - 80;

                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                this.canvas.width = width;
                this.canvas.height = height;

                this.ctx.drawImage(img, 0, 0, width, height);
                this.currentImage = img;
                this.originalImageData = this.ctx.getImageData(0, 0, width, height);

                // Hide upload hint
                this.uploadHint.style.display = 'none';
                this.canvasWrapper.classList.add('has-image');

                // Reset sliders
                this.resetSliders();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resetSliders() {
        Object.values(this.sliders).forEach(({ slider, input }) => {
            slider.value = 0;
            input.value = 0;
        });
        this.applyAdjustments();
    }

    applyAdjustments() {
        if (!this.originalImageData) return;

        const imageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        // Get slider values
        const exposure = parseInt(this.sliders.exposure.slider.value) / 100;
        const contrast = parseInt(this.sliders.contrast.slider.value) / 100;
        const saturation = parseInt(this.sliders.saturation.slider.value) / 100;
        const tint = parseInt(this.sliders.tint.slider.value) / 100;
        const temperature = parseInt(this.sliders.temperature.slider.value) / 100;
        const sharpen = parseInt(this.sliders.sharpen.slider.value) / 100;
        const highlight = parseInt(this.sliders.highlight.slider.value) / 100;
        const shadow = parseInt(this.sliders.shadow.slider.value) / 100;
        const black = parseInt(this.sliders.black.slider.value) / 100;
        const white = parseInt(this.sliders.white.slider.value) / 100;

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Exposure (brightness)
            r = Math.min(255, r * (1 + exposure));
            g = Math.min(255, g * (1 + exposure));
            b = Math.min(255, b * (1 + exposure));

            // Contrast
            r = (r - 128) * (1 + contrast) + 128;
            g = (g - 128) * (1 + contrast) + 128;
            b = (b - 128) * (1 + contrast) + 128;

            // Temperature (warmer = more red/less blue)
            r = Math.min(255, r * (1 + temperature * 0.3));
            b = Math.max(0, b * (1 - temperature * 0.3));

            // Tint (green-magenta)
            g = Math.min(255, g * (1 + tint * 0.2));

            // Highlight
            const brightness = (r + g + b) / 3;
            if (brightness > 128) {
                r = Math.min(255, r * (1 + highlight * 0.3));
                g = Math.min(255, g * (1 + highlight * 0.3));
                b = Math.min(255, b * (1 + highlight * 0.3));
            }

            // Shadow
            if (brightness < 128) {
                r = Math.max(0, r * (1 + shadow * 0.3));
                g = Math.max(0, g * (1 + shadow * 0.3));
                b = Math.max(0, b * (1 + shadow * 0.3));
            }

            // Black point
            const minVal = Math.min(r, g, b);
            if (minVal > 0) {
                r = Math.max(0, r - minVal * Math.abs(black) * 0.5);
                g = Math.max(0, g - minVal * Math.abs(black) * 0.5);
                b = Math.max(0, b - minVal * Math.abs(black) * 0.5);
            }

            // White point
            const maxVal = Math.max(r, g, b);
            if (maxVal < 255 && white > 0) {
                r = Math.min(255, r + (255 - maxVal) * white * 0.5);
                g = Math.min(255, g + (255 - maxVal) * white * 0.5);
                b = Math.min(255, b + (255 - maxVal) * white * 0.5);
            }

            // Saturation
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const avg = (max + min) / 2;

            if (saturation !== 0) {
                const sat = saturation > 0 ? 1 + saturation : 1 + saturation;
                r = Math.round((r - avg) * sat + avg);
                g = Math.round((g - avg) * sat + avg);
                b = Math.round((b - avg) * sat + avg);
            }

            // Sharpen (simplified)
            if (sharpen > 0) {
                r = Math.min(255, r * (1 + sharpen * 0.2));
                g = Math.min(255, g * (1 + sharpen * 0.2));
                b = Math.min(255, b * (1 + sharpen * 0.2));
            }

            // Clamp values
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    getConfigValues() {
        return {
            exposure: parseInt(this.sliders.exposure.slider.value),
            contrast: parseInt(this.sliders.contrast.slider.value),
            saturation: parseInt(this.sliders.saturation.slider.value),
            tint: parseInt(this.sliders.tint.slider.value),
            temperature: parseInt(this.sliders.temperature.slider.value),
            sharpen: parseInt(this.sliders.sharpen.slider.value),
            highlight: parseInt(this.sliders.highlight.slider.value),
            shadow: parseInt(this.sliders.shadow.slider.value),
            black: parseInt(this.sliders.black.slider.value),
            white: parseInt(this.sliders.white.slider.value)
        };
    }

    setConfigValues(config) {
        this.sliders.exposure.slider.value = config.exposure;
        this.sliders.exposure.input.value = config.exposure;

        this.sliders.contrast.slider.value = config.contrast;
        this.sliders.contrast.input.value = config.contrast;

        this.sliders.saturation.slider.value = config.saturation;
        this.sliders.saturation.input.value = config.saturation;

        this.sliders.tint.slider.value = config.tint;
        this.sliders.tint.input.value = config.tint;

        this.sliders.temperature.slider.value = config.temperature;
        this.sliders.temperature.input.value = config.temperature;

        this.sliders.sharpen.slider.value = config.sharpen;
        this.sliders.sharpen.input.value = config.sharpen;

        this.sliders.highlight.slider.value = config.highlight;
        this.sliders.highlight.input.value = config.highlight;

        this.sliders.shadow.slider.value = config.shadow;
        this.sliders.shadow.input.value = config.shadow;

        this.sliders.black.slider.value = config.black;
        this.sliders.black.input.value = config.black;

        this.sliders.white.slider.value = config.white;
        this.sliders.white.input.value = config.white;

        this.applyAdjustments();
    }

    saveConfigWithName(name) {
        const configuration = {
            name: name,
            values: this.getConfigValues(),
            timestamp: new Date().toLocaleString('id-ID')
        };

        const configId = `adjustment-config-${Date.now()}`;
        localStorage.setItem(configId, JSON.stringify(configuration));
        this.showNotification(`Konfigurasi "${name}" berhasil disimpan`);
    }

    showSaveConfigModal() {
        const modal = document.getElementById('saveConfigModal');
        const input = document.getElementById('configNameInput');
        modal.classList.add('show');
        input.focus();

        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                const name = input.value.trim();
                if (name) {
                    this.saveConfigWithName(name);
                    modal.classList.remove('show');
                    input.value = '';
                    input.removeEventListener('keypress', handleEnter);
                }
            }
        };
        input.addEventListener('keypress', handleEnter);
    }

    showLoadConfigModal() {
        const modal = document.getElementById('loadConfigModal');
        const configList = document.getElementById('configList');

        const configs = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('adjustment-config-')) {
                configs.push({
                    key,
                    data: JSON.parse(localStorage.getItem(key))
                });
            }
        }

        configs.sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp));

        if (configs.length === 0) {
            configList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Tidak ada konfigurasi yang disimpan</div>';
        } else {
            configList.innerHTML = configs.map((config) => `
                <div class="preset-item" data-key="${config.key}">
                    <div class="preset-item-info">
                        <div class="preset-item-name">${config.data.name}</div>
                        <div class="preset-item-date">${config.data.timestamp}</div>
                    </div>
                    <button class="preset-item-delete" onclick="event.stopPropagation()">
                        Hapus
                    </button>
                </div>
            `).join('');

            configList.querySelectorAll('.preset-item').forEach(item => {
                item.addEventListener('click', () => {
                    const key = item.dataset.key;
                    const configData = configs.find(c => c.key === key).data;
                    this.loadConfigData(configData);
                    modal.classList.remove('show');
                });
            });

            configList.querySelectorAll('.preset-item-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const key = btn.closest('.preset-item').dataset.key;
                    if (confirm('Hapus konfigurasi ini?')) {
                        localStorage.removeItem(key);
                        this.showLoadConfigModal();
                        this.showNotification('Konfigurasi dihapus');
                    }
                });
            });
        }

        modal.classList.add('show');
    }

    loadConfigData(configData) {
        this.setConfigValues(configData.values);
        this.showNotification(`Konfigurasi "${configData.name}" dimuat`);
    }

    exportImage() {
        if (!this.originalImageData) {
            alert('Silakan unggah gambar terlebih dahulu');
            return;
        }

        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `adjusted_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('Gambar berhasil diekspor');
        });
    }

    showNotification(message) {
        const modal = document.getElementById('notificationModal');
        const messageEl = document.getElementById('notificationMessage');
        messageEl.textContent = message;
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 2000);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    window.adjustmentEditor = new AdjustmentEditorAzalea();
});
