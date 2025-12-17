class CalendarManager {
    constructor() {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.today = new Date();
        this.events = [];

        // Indonesian month and day names
        this.monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        this.dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        // DOM elements
        this.calendarDaysContainer = document.getElementById('calendarDays');
        this.eventsListContainer = document.getElementById('eventsList');
        this.monthYearDisplay = document.querySelector('.calendar-month-year');
        this.prevMonthBtn = document.querySelector('.prev-month');
        this.nextMonthBtn = document.querySelector('.next-month');
        this.createEventBtn = document.getElementById('createEventBtn');
        this.createEventModal = document.getElementById('createEventModal');
        this.closeCreateEventModal = document.getElementById('closeCreateEventModal');
        this.cancelCreateEventBtn = document.getElementById('cancelCreateEventBtn');
        this.confirmCreateEventBtn = document.getElementById('confirmCreateEventBtn');
        this.eventNameInput = document.getElementById('eventNameInput');
        this.eventDateInput = document.getElementById('eventDateInput');
        this.eventTimeInput = document.getElementById('eventTimeInput');

        this.init();
    }

    init() {
        this.loadEvents();
        this.bindEvents();
        this.renderCalendar();
        this.renderEventsList();
    }

    bindEvents() {
        // Calendar navigation
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());

        // Modal events
        this.createEventBtn.addEventListener('click', () => this.showCreateEventModal());
        this.closeCreateEventModal.addEventListener('click', () => this.closeModal());
        this.cancelCreateEventBtn.addEventListener('click', () => this.closeModal());
        this.confirmCreateEventBtn.addEventListener('click', () => this.createEvent());

        // Modal close on outside click
        this.createEventModal.addEventListener('click', (e) => {
            if (e.target === this.createEventModal) {
                this.closeModal();
            }
        });

        // Modal close on Enter key
        this.eventNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createEvent();
        });
    }

    loadEvents() {
        this.events = [];
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('calendar-event-')) {
                try {
                    const event = JSON.parse(localStorage.getItem(key));
                    this.events.push({...event, storageKey: key});
                } catch (e) {
                    console.error('Error loading event:', e);
                }
            }
        });
        this.sortEvents();
    }

    sortEvents() {
        this.events.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
            return dateA - dateB;
        });
    }

    saveEvent(event) {
        const timestamp = Date.now();
        const storageKey = `calendar-event-${timestamp}`;
        const eventData = {
            name: event.name,
            date: event.date,
            time: event.time,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(eventData));
        this.loadEvents();
        this.renderCalendar();
        this.renderEventsList();
        this.syncToInbox();
    }

    deleteEvent(storageKey) {
        localStorage.removeItem(storageKey);
        this.loadEvents();
        this.renderCalendar();
        this.renderEventsList();
        this.syncToInbox();
    }

    renderCalendar() {
        // Clear calendar
        this.calendarDaysContainer.innerHTML = '';

        // Update month/year display
        this.monthYearDisplay.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;

        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

        // Add previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = this.createDayElement(day, 'other-month', null);
            this.calendarDaysContainer.appendChild(dayElement);
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = this.isToday(dateStr);
            const hasEvent = this.hasEventOnDate(dateStr);
            const className = `${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`.trim();
            const dayElement = this.createDayElement(day, className, dateStr);
            this.calendarDaysContainer.appendChild(dayElement);
        }

        // Add next month's leading days
        const remainingDays = 42 - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = this.createDayElement(day, 'other-month', null);
            this.calendarDaysContainer.appendChild(dayElement);
        }
    }

    createDayElement(day, className, dateStr) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className}`;
        dayElement.textContent = day;

        if (dateStr && className !== 'other-month') {
            dayElement.addEventListener('click', () => {
                const dateInput = this.eventDateInput;
                dateInput.value = dateStr;
            });
        }

        return dayElement;
    }

    isToday(dateStr) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return dateStr === todayStr;
    }

    hasEventOnDate(dateStr) {
        return this.events.some(event => event.date === dateStr);
    }

    renderEventsList() {
        this.eventsListContainer.innerHTML = '';

        if (this.events.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-events-message';
            emptyMessage.innerHTML = '<p>Tidak ada event tersimpan</p>';
            this.eventsListContainer.appendChild(emptyMessage);
            return;
        }

        this.events.forEach(event => {
            const eventItem = this.createEventItemElement(event);
            this.eventsListContainer.appendChild(eventItem);
        });
    }

    createEventItemElement(event) {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';

        const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
        const formattedDate = this.formatEventDate(event.date);
        const timeText = event.time ? event.time : 'Sepanjang hari';
        const createdAt = this.getTimeAgo(new Date(event.createdAt));

        eventItem.innerHTML = `
            <div class="event-header">
                <div class="event-info">
                    <div class="event-icon-placeholder reminder">
                        <i class="bi bi-briefcase-fill"></i>
                    </div>
                    <div class="event-text">
                        <h3 class="event-title">
                            <strong>Pengingat</strong> ${event.name}
                        </h3>
                        <p class="event-date">${formattedDate} ${event.time ? `- ${timeText} WIB` : ''}</p>
                    </div>
                </div>
                <div class="event-time">${createdAt}</div>
            </div>
            <div class="event-actions">
                <a href="#" class="action-link action-delete" data-storage-key="${event.storageKey}">Hapus</a>
            </div>
        `;

        // Delete button handler
        const deleteBtn = eventItem.querySelector('.action-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteEvent(event.storageKey);
        });

        return eventItem;
    }

    formatEventDate(dateStr) {
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

    showCreateEventModal() {
        this.createEventModal.classList.add('show');
        this.eventNameInput.focus();
        // Set today's date as default
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        this.eventDateInput.value = dateStr;
    }

    closeModal() {
        this.createEventModal.classList.remove('show');
        this.eventNameInput.value = '';
        this.eventDateInput.value = '';
        this.eventTimeInput.value = '';
    }

    createEvent() {
        const name = this.eventNameInput.value.trim();
        const date = this.eventDateInput.value;
        const time = this.eventTimeInput.value;

        if (!name) {
            alert('Masukkan nama event');
            return;
        }

        if (!date) {
            alert('Pilih tanggal event');
            return;
        }

        this.saveEvent({
            name,
            date,
            time
        });

        this.closeModal();
        this.showNotification('Event berhasil dibuat!');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    syncToInbox() {
        // Trigger storage event to notify inbox.js
        const event = new Event('calendarUpdated');
        window.dispatchEvent(event);
    }

    previousMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
        this.renderCalendar();
    }

    nextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
        this.renderCalendar();
    }
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CalendarManager();
});
