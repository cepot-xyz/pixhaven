// Image Lightbox for Dibagikan page
class GalleryLightbox {
    constructor() {
        this.lightbox = document.getElementById('imageLightbox');
        this.lightboxOverlay = document.getElementById('lightboxOverlay');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.lightboxContent = document.querySelector('.lightbox-content');
        this.lightboxClose = document.getElementById('lightboxClose');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.zoomLevel = document.getElementById('zoomLevel');
        
        this.currentZoom = 100;
        this.minZoom = 50;
        this.maxZoom = 300;
        this.zoomStep = 10;
        
        // Dragging variables
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        
        this.init();
    }
    
    init() {
        // Close button
        this.lightboxClose.addEventListener('click', () => this.closeLightbox());
        
        // Zoom buttons
        this.zoomInBtn.addEventListener('click', () => this.zoom(this.zoomStep));
        this.zoomOutBtn.addEventListener('click', () => this.zoom(-this.zoomStep));
        
        // Mouse wheel zoom
        this.lightboxContent.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Dragging
        this.lightboxImage.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch support
        this.lightboxImage.addEventListener('touchstart', (e) => this.startDrag(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.endDrag());
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox();
            }
        });
        
        // Close on overlay click
        this.lightboxOverlay.addEventListener('click', () => this.closeLightbox());
        
        // Bind gallery items
        this.bindGalleryItems();
    }
    
    bindGalleryItems() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const imagePaths = [
            'assets/images/Photo 1.png',
            'assets/images/Photo 2.png',
            'assets/images/Photo 3.png',
            'assets/images/Photo 4.png',
            'assets/images/Photo 5.png',
            'assets/images/Photo 6.png'
        ];
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.showImage(imagePaths[index]);
            });
            // Make items clickable with cursor
            item.style.cursor = 'pointer';
        });
    }
    
    showImage(imageSrc) {
        this.lightboxImage.src = imageSrc;
        this.lightbox.classList.add('show');
        
        // Wait for image to load then resize container
        const img = new Image();
        img.onload = () => {
            this.resizeContainerToImage(img.width, img.height);
        };
        img.src = imageSrc;
        
        this.resetZoomAndPosition();
        document.body.style.overflow = 'hidden';
    }
    
    resizeContainerToImage(imgWidth, imgHeight) {
        const container = document.querySelector('.lightbox-container');
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.85;
        
        // Calculate aspect ratio
        const aspectRatio = imgWidth / imgHeight;
        let width = imgWidth;
        let height = imgHeight;
        
        // Scale down if image is too large
        if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
        }
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        // Set container size with some padding
        container.style.width = (width + 32) + 'px';
        container.style.height = (height + 80) + 'px';
    }
    
    closeLightbox() {
        this.lightbox.classList.remove('show');
        document.body.style.overflow = '';
        this.resetZoomAndPosition();
    }
    
    zoom(delta) {
        const newZoom = this.currentZoom + delta;
        
        if (newZoom >= this.minZoom && newZoom <= this.maxZoom) {
            this.currentZoom = newZoom;
            this.updateImageTransform();
        }
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        // Zoom in/out based on wheel direction
        const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
        this.zoom(delta);
    }
    
    startDrag(e) {
        if (this.currentZoom <= 100) return;
        
        e.preventDefault();
        this.isDragging = true;
        this.lightboxContent.classList.add('dragging');
        
        // Handle both mouse and touch events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        this.startX = clientX;
        this.startY = clientY;
    }
    
    drag(e) {
        if (!this.isDragging || this.currentZoom <= 100) return;
        
        e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - this.startX;
        const deltaY = clientY - this.startY;
        
        this.translateX += deltaX;
        this.translateY += deltaY;
        
        // Limit dragging to reasonable bounds
        const maxTranslate = (this.currentZoom - 100) * 2;
        this.translateX = Math.max(-maxTranslate, Math.min(maxTranslate, this.translateX));
        this.translateY = Math.max(-maxTranslate, Math.min(maxTranslate, this.translateY));
        
        this.startX = clientX;
        this.startY = clientY;
        
        this.updateImageTransform();
    }
    
    endDrag() {
        this.isDragging = false;
        this.lightboxContent.classList.remove('dragging');
    }
    
    updateImageTransform() {
        const scale = this.currentZoom / 100;
        this.lightboxImage.style.transform = `scale(${scale}) translate(${this.translateX}px, ${this.translateY}px)`;
        this.zoomLevel.textContent = `${this.currentZoom}%`;
    }
    
    resetZoomAndPosition() {
        this.currentZoom = 100;
        this.translateX = 0;
        this.translateY = 0;
        this.updateImageTransform();
    }
}

// Initialize lightbox when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GalleryLightbox();
});
