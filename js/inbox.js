class InboxManager {
    constructor() {
        this.remindersContainer = document.getElementById('calendarRemindersContainer');
        this.dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        this.monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        this.init();
    }

    init() {
        this.loadCalendarReminders();
        // Listen for calendar updates
        window.addEventListener('calendarUpdated', () => {
            this.loadCalendarReminders();
        });
    }

    loadCalendarReminders() {
        const reminders = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('calendar-event-')) {
                try {
                    const event = JSON.parse(localStorage.getItem(key));
                    reminders.push({...event, storageKey: key});
                } catch (e) {
                    console.error('Error loading reminder:', e);
                }
            }
        });

        // Sort by date
        reminders.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
            return dateA - dateB;
        });

        this.renderReminders(reminders);
    }

    renderReminders(reminders) {
        this.remindersContainer.innerHTML = '';

        if (reminders.length === 0) {
            return; // No reminders to display
        }

        reminders.forEach(reminder => {
            const reminderElement = this.createReminderElement(reminder);
            this.remindersContainer.appendChild(reminderElement);
        });
    }

    createReminderElement(reminder) {
        const item = document.createElement('div');
        item.className = 'inbox-item';

        const formattedDate = this.formatDate(reminder.date);
        const timeText = reminder.time ? reminder.time : 'Sepanjang hari';
        const createdAt = this.getTimeAgo(new Date(reminder.createdAt));

        item.innerHTML = `
            <div class="inbox-item-header">
                <div class="inbox-item-info">
                    <div class="inbox-icon-placeholder reminder">
                        <i class="bi bi-briefcase-fill"></i>
                    </div>
                    <div class="inbox-item-text">
                        <h3 class="inbox-item-title">
                            <strong>Pengingat</strong> ${reminder.name}
                        </h3>
                        <p class="inbox-item-subtitle">${formattedDate}${reminder.time ? ` - ${timeText} WIB` : ''}</p>
                    </div>
                </div>
                <div class="inbox-item-time">${createdAt}</div>
            </div>
            <div class="inbox-item-actions">
                <a href="#" class="action-link action-open">Buka</a>
                <a href="#" class="action-link action-delete" data-storage-key="${reminder.storageKey}">Hapus</a>
            </div>
        `;

        // Delete button handler
        const deleteBtn = item.querySelector('.action-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteReminder(reminder.storageKey);
        });

        // Open button handler (placeholder)
        const openBtn = item.querySelector('.action-open');
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Can redirect to calendar page with reminder details
        });

        return item;
    }

    formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, parseInt(month) - 1, day);
        const dayName = this.dayNames[date.getDay()];
        return `${dayName} ${parseInt(day)} ${this.monthNames[parseInt(month) - 1]}`;
    }

    getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        if (days < 7) return `${days} hari yang lalu`;
        return date.toLocaleDateString('id-ID');
    }

    deleteReminder(storageKey) {
        localStorage.removeItem(storageKey);
        this.loadCalendarReminders();
        // Notify calendar of deletion
        const event = new Event('calendarUpdated');
        window.dispatchEvent(event);
    }
}

// Initialize inbox manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new InboxManager();
});
