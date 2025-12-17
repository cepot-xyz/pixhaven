// ===== COLOR CURVES EDITOR =====

class CurveEditor {
    constructor() {
        // Canvas elements
        this.imageCanvas = document.getElementById('imageCanvas');
        this.curveCanvas = document.getElementById('curveCanvas');
        this.imageCtx = this.imageCanvas.getContext('2d', { willReadFrequently: true });
        this.curveCtx = this.curveCanvas.getContext('2d');

        // Inputs & Overlays
        this.imageInput = document.getElementById('imageInput');
        this.uploadOverlay = document.getElementById('uploadOverlay');

        // Buttons
        this.exportBtn = document.querySelector('.btn-export-curve');
        this.resetBtn = document.querySelector('.btn-reset');
        this.loadPresetBtn = document.querySelector('.btn-load-preset');
        this.savePresetBtn = document.querySelector('.btn-save-preset');
        this.curveTabs = document.querySelectorAll('.curve-tab');

        // Image data
        this.originalImageData = null;
        this.currentImage = null;
        this.isDragging = false;
        this.draggedPointIndex = -1;

        // Current channel (all, red, green, blue)
        this.currentChannel = 'all';

        // Curve points: each channel has array of {x: 0-255, y: 0-255}
        this.curvePoints = {
            all: [
                { x: 0, y: 0 },
                { x: 255, y: 255 }
            ],
            red: [
                { x: 0, y: 0 },
                { x: 255, y: 255 }
            ],
            green: [
                { x: 0, y: 0 },
                { x: 255, y: 255 }
            ],
            blue: [
                { x: 0, y: 0 },
                { x: 255, y: 255 }
            ]
        };

        this.init();
    }

    init() {
        this.setupCanvasSize();
        this.bindEvents();
        this.drawCurve();
    }

    setupCanvasSize() {
        // Set curve canvas dimensions
        this.curveCanvas.width = this.curveCanvas.offsetWidth;
        this.curveCanvas.height = this.curveCanvas.offsetHeight;
    }

    bindEvents() {
        // File upload
        this.uploadOverlay.addEventListener('click', () => this.imageInput.click());
        this.uploadOverlay.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadOverlay.style.backgroundColor = '#f0f0f0';
        });
        this.uploadOverlay.addEventListener('dragleave', () => {
            this.uploadOverlay.style.backgroundColor = 'transparent';
        });
        this.uploadOverlay.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadOverlay.style.backgroundColor = 'transparent';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.loadImage(file);
            }
        });

        this.imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadImage(e.target.files[0]);
            }
        });

        // Curve canvas interactions
        this.curveCanvas.addEventListener('mousedown', (e) => this.onCurveMouseDown(e));
        this.curveCanvas.addEventListener('mousemove', (e) => this.onCurveMouseMove(e));
        this.curveCanvas.addEventListener('mouseup', () => this.onCurveMouseUp());
        this.curveCanvas.addEventListener('mouseleave', () => this.onCurveMouseUp());

        // Tab switching
        this.curveTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.curveTabs.forEach(t => t.classList.remove('active'));
                e.target.closest('.curve-tab').classList.add('active');
                this.currentChannel = e.target.closest('.curve-tab').dataset.channel;
                this.drawCurve();
            });
        });

        // Buttons
        this.resetBtn.addEventListener('click', () => this.resetCurve());
        this.exportBtn.addEventListener('click', () => this.exportImage());
        this.loadPresetBtn.addEventListener('click', () => this.showLoadPresetModal());
        this.savePresetBtn.addEventListener('click', () => this.showSavePresetModal());

        // Modal elements
        const savePresetModal = document.getElementById('savePresetModal');
        const loadPresetModal = document.getElementById('loadPresetModal');
        const presetNameInput = document.getElementById('presetNameInput');
        const confirmSaveBtn = document.getElementById('confirmSavePresetBtn');
        const cancelSaveBtn = document.getElementById('cancelSavePresetBtn');
        const cancelLoadBtn = document.getElementById('cancelLoadPresetBtn');

        // Save preset modal
        confirmSaveBtn.addEventListener('click', () => {
            const name = presetNameInput.value.trim();
            if (name) {
                this.savePresetWithName(name);
                savePresetModal.classList.remove('show');
                presetNameInput.value = '';
            } else {
                alert('Silakan masukkan nama preset');
            }
        });

        cancelSaveBtn.addEventListener('click', () => {
            savePresetModal.classList.remove('show');
            presetNameInput.value = '';
        });

        // Close modal when clicking outside
        savePresetModal.addEventListener('click', (e) => {
            if (e.target === savePresetModal) {
                savePresetModal.classList.remove('show');
                presetNameInput.value = '';
            }
        });

        // Load preset modal
        cancelLoadBtn.addEventListener('click', () => {
            loadPresetModal.classList.remove('show');
        });

        loadPresetModal.addEventListener('click', (e) => {
            if (e.target === loadPresetModal) {
                loadPresetModal.classList.remove('show');
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvasSize();
            this.drawCurve();
        });
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Set canvas size based on image
                const maxWidth = this.imageCanvas.parentElement.offsetWidth;
                const maxHeight = this.imageCanvas.parentElement.offsetHeight;
                
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                this.imageCanvas.width = width;
                this.imageCanvas.height = height;

                this.imageCtx.drawImage(img, 0, 0, width, height);
                this.currentImage = img;
                this.originalImageData = this.imageCtx.getImageData(0, 0, width, height);

                // Hide upload overlay
                this.uploadOverlay.style.display = 'none';
                document.querySelector('.preview-wrapper').classList.add('has-image');

                // Apply current curve
                this.applyColorCurve();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    onCurveMouseDown(e) {
        const rect = this.curveCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const padding = 40; // padding dari edges
        const graphWidth = rect.width - padding * 2;
        const graphHeight = rect.height - padding * 2;

        const canvasX = ((x - padding) / graphWidth) * 255;
        const canvasY = ((y - padding) / graphHeight) * 255;
        const canvasY_inverted = 255 - canvasY;

        // Check if clicking on existing point (with hitbox tolerance)
        const hitboxRadius = 8;
        const points = this.curvePoints[this.currentChannel];
        for (let i = 0; i < points.length; i++) {
            const px = padding + (points[i].x / 255) * graphWidth;
            const py = padding + (255 - points[i].y) / 255 * graphHeight;
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
            
            if (distance < hitboxRadius) {
                this.isDragging = true;
                this.draggedPointIndex = i;
                return;
            }
        }

        // Add new point if not on endpoints and within graph
        if (canvasX > 0 && canvasX < 255 && canvasY_inverted >= 0 && canvasY_inverted <= 255) {
            points.push({ x: Math.round(canvasX), y: Math.round(canvasY_inverted) });
            points.sort((a, b) => a.x - b.x);
            this.draggedPointIndex = points.indexOf(points.find(p => p.x === Math.round(canvasX)));
            this.isDragging = true;
            this.drawCurve();
            this.applyColorCurve();
        }
    }

    onCurveMouseMove(e) {
        if (!this.isDragging || this.draggedPointIndex === -1) return;

        const rect = this.curveCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const padding = 40;
        const graphWidth = rect.width - padding * 2;
        const graphHeight = rect.height - padding * 2;

        const canvasX = ((x - padding) / graphWidth) * 255;
        const canvasY = ((y - padding) / graphHeight) * 255;
        const canvasY_inverted = 255 - canvasY;

        const points = this.curvePoints[this.currentChannel];
        const point = points[this.draggedPointIndex];

        // Constrain to graph bounds
        const newX = Math.max(0, Math.min(255, canvasX));
        const newY = Math.max(0, Math.min(255, canvasY_inverted));

        // Don't allow dragging endpoints horizontally
        if (this.draggedPointIndex === 0) {
            point.x = 0;
            point.y = Math.round(newY);
        } else if (this.draggedPointIndex === points.length - 1) {
            point.x = 255;
            point.y = Math.round(newY);
        } else {
            point.x = Math.round(newX);
            point.y = Math.round(newY);
        }

        // Keep points sorted
        points.sort((a, b) => a.x - b.x);
        this.draggedPointIndex = points.indexOf(point);

        this.drawCurve();
        this.applyColorCurve();
    }

    onCurveMouseUp() {
        this.isDragging = false;
        this.draggedPointIndex = -1;
    }

    // Cubic spline interpolation
    interpolateCurve(points) {
        if (points.length < 2) return [0, 255];

        // Build lookup table with spline interpolation
        const lut = new Array(256);
        
        for (let i = 0; i < 256; i++) {
            // Find surrounding points
            let p0, p1, p2, p3;
            let t;

            if (i <= points[0].x) {
                lut[i] = points[0].y;
            } else if (i >= points[points.length - 1].x) {
                lut[i] = points[points.length - 1].y;
            } else {
                // Find segment
                let segmentIdx = 0;
                for (let j = 0; j < points.length - 1; j++) {
                    if (i >= points[j].x && i <= points[j + 1].x) {
                        segmentIdx = j;
                        break;
                    }
                }

                p1 = points[segmentIdx];
                p2 = points[segmentIdx + 1];
                p0 = segmentIdx > 0 ? points[segmentIdx - 1] : p1;
                p3 = segmentIdx < points.length - 2 ? points[segmentIdx + 2] : p2;

                // Normalized position between p1 and p2
                t = (i - p1.x) / (p2.x - p1.x);

                // Catmull-Rom spline
                const t2 = t * t;
                const t3 = t2 * t;

                const a0 = -0.5 * p0.y + 1.5 * p1.y - 1.5 * p2.y + 0.5 * p3.y;
                const a1 = p0.y - 2.5 * p1.y + 2 * p2.y - 0.5 * p3.y;
                const a2 = -0.5 * p0.y + 0.5 * p2.y;
                const a3 = p1.y;

                lut[i] = Math.round(Math.max(0, Math.min(255, a0 * t3 + a1 * t2 + a2 * t + a3)));
            }
        }

        return lut;
    }

    applyColorCurve() {
        if (!this.originalImageData) return;

        const imageData = new ImageData(
            new Uint8ClampedArray(this.originalImageData.data),
            this.originalImageData.width,
            this.originalImageData.height
        );

        // Get lookup tables
        const lut_all = this.interpolateCurve(this.curvePoints.all);
        const lut_red = this.interpolateCurve(this.curvePoints.red);
        const lut_green = this.interpolateCurve(this.curvePoints.green);
        const lut_blue = this.interpolateCurve(this.curvePoints.blue);

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Apply all curve first, then individual channels
            data[i] = lut_red[lut_all[r]];
            data[i + 1] = lut_green[lut_all[g]];
            data[i + 2] = lut_blue[lut_all[b]];
        }

        this.imageCtx.putImageData(imageData, 0, 0);
    }

    drawCurve() {
        const canvas = this.curveCanvas;
        const ctx = this.curveCtx;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#e8e8e8';
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let i = 0; i <= 4; i++) {
            const x = padding + (graphWidth / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = padding + (graphHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Diagonal line (linear / no change)
        ctx.strokeStyle = '#d0d0d0';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, padding);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw axes
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(padding, padding);
        ctx.stroke();

        // Draw curve with color based on channel
        const points = this.curvePoints[this.currentChannel];
        
        // Determine curve color
        let curveColor = '#1a1a1a';
        if (this.currentChannel === 'red') curveColor = '#ff4444';
        if (this.currentChannel === 'green') curveColor = '#44ff44';
        if (this.currentChannel === 'blue') curveColor = '#4444ff';

        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 3;
        ctx.beginPath();

        // Draw smooth curve
        const lut = this.interpolateCurve(points);
        for (let i = 0; i < 256; i++) {
            const x = padding + (i / 255) * graphWidth;
            const y = height - padding - (lut[i] / 255) * graphHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw control points
        points.forEach((point, idx) => {
            const x = padding + (point.x / 255) * graphWidth;
            const y = height - padding - (point.y / 255) * graphHeight;

            // Circle
            ctx.fillStyle = idx === 0 || idx === points.length - 1 ? '#999' : curveColor;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Labels
        ctx.fillStyle = '#666';
        ctx.font = '12px "Albert Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Input (0-255)', width / 2, height - 10);

        ctx.save();
        ctx.translate(10, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Output (0-255)', 0, 0);
        ctx.restore();
    }

    resetCurve() {
        this.curvePoints[this.currentChannel] = [
            { x: 0, y: 0 },
            { x: 255, y: 255 }
        ];
        this.drawCurve();
        this.applyColorCurve();
        this.showNotification('Kurva direset');
    }

    exportImage() {
        if (!this.originalImageData) {
            alert('Silakan unggah gambar terlebih dahulu');
            return;
        }

        this.imageCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edited_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('Gambar berhasil diekspor');
        });
    }

    savePresetWithName(name) {
        const preset = {
            name: name,
            all: JSON.stringify(this.curvePoints.all),
            red: JSON.stringify(this.curvePoints.red),
            green: JSON.stringify(this.curvePoints.green),
            blue: JSON.stringify(this.curvePoints.blue),
            timestamp: new Date().toLocaleString('id-ID')
        };

        const presetId = `curve-preset-${Date.now()}`;
        localStorage.setItem(presetId, JSON.stringify(preset));
        this.showNotification(`Preset "${name}" berhasil disimpan`);
    }

    showSavePresetModal() {
        const modal = document.getElementById('savePresetModal');
        const input = document.getElementById('presetNameInput');
        modal.classList.add('show');
        input.focus();

        // Allow Enter key to save
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                const name = input.value.trim();
                if (name) {
                    this.savePresetWithName(name);
                    modal.classList.remove('show');
                    input.value = '';
                    input.removeEventListener('keypress', handleEnter);
                }
            }
        };
        input.addEventListener('keypress', handleEnter);
    }

    showLoadPresetModal() {
        const modal = document.getElementById('loadPresetModal');
        const presetList = document.getElementById('presetList');

        // Get all presets
        const presets = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('curve-preset-')) {
                presets.push({
                    key,
                    data: JSON.parse(localStorage.getItem(key))
                });
            }
        }

        // Sort by timestamp (newest first)
        presets.sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp));

        if (presets.length === 0) {
            presetList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Tidak ada preset yang disimpan</div>';
        } else {
            presetList.innerHTML = presets.map((preset, idx) => `
                <div class="preset-item" data-key="${preset.key}">
                    <div class="preset-item-info">
                        <div class="preset-item-name">${preset.data.name}</div>
                        <div class="preset-item-date">${preset.data.timestamp}</div>
                    </div>
                    <button class="preset-item-delete" onclick="event.stopPropagation()">
                        Hapus
                    </button>
                </div>
            `).join('');

            // Add click handlers
            presetList.querySelectorAll('.preset-item').forEach(item => {
                item.addEventListener('click', () => {
                    const key = item.dataset.key;
                    const presetData = presets.find(p => p.key === key).data;
                    this.loadPresetData(presetData);
                    modal.classList.remove('show');
                });
            });

            // Add delete handlers
            presetList.querySelectorAll('.preset-item-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const key = btn.closest('.preset-item').dataset.key;
                    if (confirm('Hapus preset ini?')) {
                        localStorage.removeItem(key);
                        this.showLoadPresetModal(); // Refresh modal
                        this.showNotification('Preset dihapus');
                    }
                });
            });
        }

        modal.classList.add('show');
    }

    loadPresetData(presetData) {
        this.curvePoints.all = JSON.parse(presetData.all);
        this.curvePoints.red = JSON.parse(presetData.red);
        this.curvePoints.green = JSON.parse(presetData.green);
        this.curvePoints.blue = JSON.parse(presetData.blue);

        this.drawCurve();
        this.applyColorCurve();
        this.showNotification(`Preset "${presetData.name}" dimuat`);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CurveEditor();
});
