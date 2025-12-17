document.addEventListener('DOMContentLoaded', function() {
    const pickFolderBtn = document.getElementById('pickFolderBtn');
    const folderInput = document.getElementById('folderInput');
    const sorterGrid = document.getElementById('sorterGrid');
    const sortModeButtons = document.querySelectorAll('.sort-mode-btn');
    const breadcrumbNav = document.getElementById('breadcrumbNav');
    const sortModeSection = document.getElementById('sortModeSection');
    const emptyState = document.getElementById('emptyState');
    
    // Move to Folder modal elements
    const moveToNewFolderBtn = document.getElementById('moveToNewFolderBtn');
    const moveToFolderModal = document.getElementById('moveToFolderModal');
    const moveToFolderInput = document.getElementById('moveToFolderInput');
    const confirmMoveBtn = document.getElementById('confirmMoveBtn');
    const cancelMoveBtn = document.getElementById('cancelMoveBtn');
    const moveFileCount = document.getElementById('moveFileCount');
    const dynamicFolderButtonsContainer = document.getElementById('dynamicFolderButtons');
    
    // Delete elements
    const deleteFileBtn = document.getElementById('deleteFileBtn');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    let currentSortMode = 'click';
    let selectedFiles = [];
    let fileMap = new Map(); // Store file references
    let currentPath = []; // Track current folder path
    let deletedFileNames = new Set(); // Track soft deleted files
    let virtualFolders = {}; // Store virtual folders in memory
    let createdFolders = []; // Store list of created folders

    // ===== FOLDER PICKER =====
    pickFolderBtn.addEventListener('click', function() {
        folderInput.click();
    });

    folderInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            displayFolderContents(files);
            sortModeSection.style.display = 'flex';
            breadcrumbNav.style.display = 'flex';
        }
    });

    // ===== DISPLAY FOLDER CONTENTS =====
    function displayFolderContents(files) {
        fileMap.clear();
        currentPath = [];
        updateBreadcrumb();
        
        // Build folder structure from file paths
        const folderStructure = {};
        
        files.forEach(file => {
            const pathParts = file.webkitRelativePath.split('/');
            let current = folderStructure;
            
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!current[part]) {
                    current[part] = { _isFolder: true };
                }
                current = current[part];
            }
            
            const fileName = pathParts[pathParts.length - 1];
            current[fileName] = {
                file: file,
                _isFolder: false,
                size: file.size,
                lastModified: new Date(file.lastModified),
                type: file.type
            };
        });
        
        displayGridItems(folderStructure, []);
    }

    // ===== DISPLAY GRID ITEMS =====
    function displayGridItems(folderObj, path) {
        sorterGrid.innerHTML = '';
        // Don't clear selectedFiles here - keep selection state
        
        const items = Object.keys(folderObj)
            .filter(key => !key.startsWith('_'))
            .filter(key => !deletedFileNames.has(key)) // Filter deleted files
            .map(key => ({
                name: key,
                data: folderObj[key],
                path: [...path, key]
            }));

        if (items.length === 0) {
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        
        // Separate folders and files
        const folders = items.filter(item => item.data._isFolder);
        const filesList = items.filter(item => !item.data._isFolder);
        
        // Display folders first
        folders.forEach(folder => {
            const folderItem = createFolderElement(folder);
            sorterGrid.appendChild(folderItem);
        });
        
        // Display files
        filesList.forEach(file => {
            const fileItem = createFileElement(file);
            sorterGrid.appendChild(fileItem);
        });

        sortFiles(currentSortMode);
        
        // Re-apply selected state to items that were selected before
        reapplySelectedState();
    }

    // ===== REAPPLY SELECTED STATE =====
    function reapplySelectedState() {
        const selectedNames = selectedFiles.map(item => item.dataset.name);
        const currentItems = document.querySelectorAll('.file-item');
        currentItems.forEach(item => {
            if (selectedNames.includes(item.dataset.name)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // ===== CREATE FOLDER ELEMENT =====
    function createFolderElement(folder) {
        const div = document.createElement('div');
        div.className = 'file-item folder-item';
        div.dataset.type = 'folder';
        div.dataset.name = folder.name;
        
        div.innerHTML = `
            <div class="file-thumbnail folder-thumbnail">
                <i class="bi bi-folder-fill"></i>
            </div>
            <span class="file-name">${folder.name}</span>
            <span class="file-type">Folder</span>
        `;
        
        div.addEventListener('dblclick', function() {
            navigateToFolder(folder.path);
        });

        div.addEventListener('click', function(e) {
            if (currentSortMode === 'click' && e.detail === 1) {
                div.classList.toggle('selected');
                updateSelectedFiles();
            }
        });
        
        return div;
    }

    // ===== CREATE FILE ELEMENT =====
    function createFileElement(file) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.dataset.type = 'file';
        div.dataset.name = file.name;
        div.dataset.date = formatDate(file.data.lastModified);
        
        const fileObj = file.data.file;
        const isImage = file.data.type.startsWith('image/');
        
        let thumbnail = '';
        if (isImage) {
            const url = URL.createObjectURL(fileObj);
            thumbnail = `<img src="${url}" alt="${file.name}">`;
        } else {
            thumbnail = `<i class="bi bi-file-earmark"></i>`;
        }
        
        div.innerHTML = `
            <div class="file-thumbnail">
                ${thumbnail}
            </div>
            <span class="file-name">${file.name}</span>
            <span class="file-date">${div.dataset.date}</span>
        `;
        
        div.addEventListener('click', function(e) {
            if (currentSortMode === 'click') {
                div.classList.toggle('selected');
                updateSelectedFiles();
            }
        });
        
        fileMap.set(file.name, fileObj);
        return div;
    }

    // ===== NAVIGATE TO FOLDER =====
    function navigateToFolder(path) {
        currentPath = path;
        updateBreadcrumb();
        
        // Rebuild display for current path
        const files = Array.from(folderInput.files);
        let currentFolder = {};
        
        files.forEach(file => {
            const pathParts = file.webkitRelativePath.split('/');
            let current = currentFolder;
            
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!current[part]) {
                    current[part] = { _isFolder: true };
                }
                current = current[part];
            }
            
            const fileName = pathParts[pathParts.length - 1];
            current[fileName] = {
                file: file,
                _isFolder: false,
                size: file.size,
                lastModified: new Date(file.lastModified),
                type: file.type
            };
        });
        
        // Navigate to current path
        let target = currentFolder;
        currentPath.forEach(part => {
            target = target[part] || {};
        });
        
        displayGridItems(target, currentPath);
    }

    // ===== UPDATE BREADCRUMB =====
    function updateBreadcrumb() {
        breadcrumbNav.innerHTML = '';
        
        const rootBtn = document.createElement('button');
        rootBtn.className = 'breadcrumb-item' + (currentPath.length === 0 ? ' active' : '');
        rootBtn.dataset.path = '';
        rootBtn.innerHTML = '<i class="bi bi-folder"></i><span>Root</span>';
        rootBtn.addEventListener('click', function() {
            currentPath = [];
            navigateToFolder([]);
        });
        breadcrumbNav.appendChild(rootBtn);
        
        let accumulatedPath = [];
        currentPath.forEach((part, index) => {
            accumulatedPath.push(part);
            const btn = document.createElement('button');
            btn.className = 'breadcrumb-item' + (index === currentPath.length - 1 ? ' active' : '');
            btn.dataset.path = accumulatedPath.join('/');
            btn.innerHTML = `<i class="bi bi-chevron-right"></i><span>${part}</span>`;
            btn.addEventListener('click', function() {
                currentPath = accumulatedPath.slice(0, index + 1);
                navigateToFolder(currentPath);
            });
            breadcrumbNav.appendChild(btn);
        });
    }

    // ===== FORMAT DATE =====
    function formatDate(date) {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${month}/${day}/${year}`;
    }

    // ===== SORT MODE BUTTONS =====
    sortModeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sortModeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSortMode = this.dataset.mode;
            updatePageTitle(currentSortMode);
            sortFiles(currentSortMode);
        });
    });

    // ===== UPDATE PAGE TITLE =====
    function updatePageTitle(mode) {
        const pageTitle = document.querySelector('.page-title');
        const titles = {
            'click': 'Photo Sorter – Sort by Click',
            'name': 'Photo Sorter – Sort by Name',
            'date': 'Photo Sorter – Sort by Date'
        };
        pageTitle.textContent = titles[mode] || titles['click'];
    }

    // ===== SORT FILES FUNCTION =====
    function sortFiles(mode) {
        const fileItems = Array.from(document.querySelectorAll('.file-item'));
        
        switch(mode) {
            case 'name':
                fileItems.sort((a, b) => {
                    const nameA = a.dataset.name.toLowerCase();
                    const nameB = b.dataset.name.toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'date':
                fileItems.sort((a, b) => {
                    const dateA = parseDate(a.dataset.date || '1/1/1970');
                    const dateB = parseDate(b.dataset.date || '1/1/1970');
                    return dateA - dateB;
                });
                break;
            case 'click':
            default:
                break;
        }
        
        fileItems.forEach(item => {
            sorterGrid.appendChild(item);
        });
    }

    // ===== PARSE DATE =====
    function parseDate(dateStr) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[0] - 1, parts[1]);
        }
        return new Date();
    }

    // ===== UPDATE SELECTED FILES =====
    function updateSelectedFiles() {
        selectedFiles = Array.from(document.querySelectorAll('.file-item.selected'));
        console.log('Selected files:', selectedFiles.length);
    }

    // ===== MOVE TO NEW FOLDER BUTTON =====
    moveToNewFolderBtn.addEventListener('click', function() {
        updateSelectedFiles();
        if (selectedFiles.length > 0) {
            moveToFolderModal.classList.add('show');
            moveToFolderInput.focus();
            moveToFolderInput.value = '';
            const count = selectedFiles.length;
            moveFileCount.textContent = `Akan memindahkan ${count} file`;
        } else {
            alert('Pilih file terlebih dahulu untuk dipindahkan');
        }
    });

    // ===== CONFIRM MOVE TO FOLDER =====
    confirmMoveBtn.addEventListener('click', function() {
        const folderName = moveToFolderInput.value.trim();
        if (folderName) {
            // Virtual folder creation
            if (!virtualFolders[folderName]) {
                virtualFolders[folderName] = [];
                
                // Add to created folders list if not already there
                if (!createdFolders.includes(folderName)) {
                    createdFolders.push(folderName);
                    saveFoldersToStorage();
                    addDynamicFolderButton(folderName);
                }
            }
            
            // Track moved files
            const movedFiles = selectedFiles.map(item => item.dataset.name);
            virtualFolders[folderName].push(...movedFiles);
            
            // Save to localStorage
            localStorage.setItem('sorter-virtual-folders', JSON.stringify(virtualFolders));
            
            // Hide moved files
            movedFiles.forEach(fileName => {
                deletedFileNames.add(fileName);
            });
            
            // Update display
            closeMoveToFolderModal();
            updatePageDisplay();
            
            // Notify user
            showNotification(`${movedFiles.length} file berhasil dipindahkan ke folder "${folderName}"`);
            selectedFiles = [];
        } else {
            alert('Masukkan nama folder tujuan');
        }
    });

    // ===== CANCEL MOVE TO FOLDER =====
    cancelMoveBtn.addEventListener('click', function() {
        closeMoveToFolderModal();
    });

    moveToFolderModal.addEventListener('click', function(e) {
        if (e.target === moveToFolderModal) {
            closeMoveToFolderModal();
        }
    });

    moveToFolderInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmMoveBtn.click();
        }
    });

    function closeMoveToFolderModal() {
        moveToFolderModal.classList.remove('show');
    }

    // ===== DELETE FILE BUTTON =====
    deleteFileBtn.addEventListener('click', function() {
        updateSelectedFiles();
        if (selectedFiles.length > 0) {
            deleteConfirmModal.classList.add('show');
        } else {
            alert('Pilih file terlebih dahulu untuk dihapus');
        }
    });

    // ===== CONFIRM DELETE =====
    confirmDeleteBtn.addEventListener('click', function() {
        const deleteFiles = selectedFiles.map(item => item.dataset.name);
        
        // Soft delete - track deleted files
        deleteFiles.forEach(fileName => {
            deletedFileNames.add(fileName);
        });
        
        // Save to localStorage
        localStorage.setItem('sorter-deleted-files', JSON.stringify(Array.from(deletedFileNames)));
        
        closeDeleteConfirmModal();
        updatePageDisplay();
        
        // Notify user
        showNotification(`${deleteFiles.length} file berhasil dihapus`);
        selectedFiles = [];
    });

    // ===== CANCEL DELETE =====
    cancelDeleteBtn.addEventListener('click', function() {
        closeDeleteConfirmModal();
    });

    deleteConfirmModal.addEventListener('click', function(e) {
        if (e.target === deleteConfirmModal) {
            closeDeleteConfirmModal();
        }
    });

    function closeDeleteConfirmModal() {
        deleteConfirmModal.classList.remove('show');
    }

    // ===== UPDATE PAGE DISPLAY =====
    function updatePageDisplay() {
        const files = Array.from(folderInput.files);
        if (files.length > 0) {
            displayFolderContents(files);
        }
    }

    // ===== LOAD DELETED FILES FROM STORAGE =====
    function loadDeletedFiles() {
        const stored = localStorage.getItem('sorter-deleted-files');
        if (stored) {
            try {
                deletedFileNames = new Set(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading deleted files:', e);
            }
        }
    }

    // ===== LOAD VIRTUAL FOLDERS FROM STORAGE =====
    function loadVirtualFolders() {
        const stored = localStorage.getItem('sorter-virtual-folders');
        if (stored) {
            try {
                virtualFolders = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading virtual folders:', e);
            }
        }
    }

    // ===== SAVE FOLDERS TO STORAGE =====
    function saveFoldersToStorage() {
        localStorage.setItem('sorter-created-folders', JSON.stringify(createdFolders));
    }

    // ===== LOAD FOLDERS FROM STORAGE =====
    function loadFoldersFromStorage() {
        const stored = localStorage.getItem('sorter-created-folders');
        if (stored) {
            try {
                createdFolders = JSON.parse(stored);
                // Render all saved buttons
                createdFolders.forEach(folderName => {
                    addDynamicFolderButton(folderName);
                });
            } catch (e) {
                console.error('Error loading folders:', e);
            }
        }
    }

    // ===== ADD DYNAMIC FOLDER BUTTON =====
    function addDynamicFolderButton(folderName) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'folder-btn-wrapper';
        buttonContainer.dataset.folderName = folderName;
        
        buttonContainer.innerHTML = `
            <button class="folder-action-btn" data-folder="${folderName}">
                <span class="folder-action-btn-text">
                    <i class="bi bi-folder-fill"></i>
                    <span>Pindah ke folder ${folderName}</span>
                </span>
                <button class="folder-action-btn-remove" data-folder="${folderName}">
                    <i class="bi bi-x"></i>
                </button>
            </button>
        `;
        
        // Main button click handler
        const mainBtn = buttonContainer.querySelector('.folder-action-btn');
        mainBtn.addEventListener('click', function(e) {
            // Don't trigger if X button is clicked
            if (!e.target.closest('.folder-action-btn-remove')) {
                moveFilesToExistingFolder(folderName);
            }
        });
        
        // Remove button click handler
        const removeBtn = buttonContainer.querySelector('.folder-action-btn-remove');
        removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            removeFolderButton(folderName);
        });
        
        dynamicFolderButtonsContainer.appendChild(buttonContainer);
    }

    // ===== MOVE FILES TO EXISTING FOLDER =====
    function moveFilesToExistingFolder(folderName) {
        updateSelectedFiles();
        if (selectedFiles.length > 0) {
            const movedFiles = selectedFiles.map(item => item.dataset.name);
            
            // Add to virtual folder if not already there
            if (!virtualFolders[folderName]) {
                virtualFolders[folderName] = [];
            }
            virtualFolders[folderName].push(...movedFiles);
            
            // Save to localStorage
            localStorage.setItem('sorter-virtual-folders', JSON.stringify(virtualFolders));
            
            // Hide moved files
            movedFiles.forEach(fileName => {
                deletedFileNames.add(fileName);
            });
            
            // Update display
            updatePageDisplay();
            
            // Notify user
            showNotification(`${movedFiles.length} file berhasil dipindahkan ke folder "${folderName}"`);
            selectedFiles = [];
        } else {
            alert('Pilih file terlebih dahulu untuk dipindahkan');
        }
    }

    // ===== REMOVE FOLDER BUTTON =====
    function removeFolderButton(folderName) {
        // Remove from created folders list
        const index = createdFolders.indexOf(folderName);
        if (index > -1) {
            createdFolders.splice(index, 1);
            saveFoldersToStorage();
        }
        
        // Remove virtual folder data
        if (virtualFolders[folderName]) {
            delete virtualFolders[folderName];
            localStorage.setItem('sorter-virtual-folders', JSON.stringify(virtualFolders));
        }
        
        // Remove button from DOM
        const buttonWrapper = document.querySelector(`[data-folder-name="${folderName}"]`);
        if (buttonWrapper) {
            buttonWrapper.remove();
        }
        
        showNotification(`Folder "${folderName}" telah dihapus`);
    }

    // Initialize by loading from localStorage
    loadDeletedFiles();
    loadVirtualFolders();
    loadFoldersFromStorage();

    // ===== NOTIFICATION FUNCTION =====
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #00a896;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 168, 150, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add animation styles if not already in CSS
    if (!document.getElementById('sorter-animations')) {
        const style = document.createElement('style');
        style.id = 'sorter-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(20px);
                }
            }
        `;
        document.head.appendChild(style);
    }
});
