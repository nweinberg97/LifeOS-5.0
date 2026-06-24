/* ==========================================================================
   LIFEOS CORE ENGINE - CENTRAL INITIALIZER & STATE ROUTER
   ========================================================================== */

// Global App State Repository
const LifeOS = {
    state: {
        currentView: 'home',
        isNavOpen: false,
        isUniversalBoardOpen: false,
        isChatOpen: false
    },
    // Primary Data Vault (LocalStorage Mirror)
    cards: JSON.parse(localStorage.getItem('lifeos_cards')) || [],
    chatHistory: JSON.parse(localStorage.getItem('lifeos_chat')) || []
};

document.addEventListener('DOMContentLoaded', () => {
    LifeOS.init();
});

LifeOS.init = function() {
    // 1. Fire up system-wide peripheral engines
    this.startClockEngine();
    this.fetchWeather();
    
    // 2. Bind application-wide event handlers
    this.bindGlobalEvents();
    
    // 3. Render initial dashboard data streams
    this.renderHomeDashboard();
};

/* ==========================================================================
   1. SYSTEM ENVIRONMENT ENGINES (CLOCK, METRICS)
   ========================================================================== */
LifeOS.startClockEngine = function() {
    const clockEl = document.getElementById('digital-clock');
    const dateEl = document.getElementById('current-date');
    
    const updateTime = () => {
        const now = new Date();
        
        // Digital Clock Numbers-Only Minimal Display
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${hours}:${minutes}`;
        
        // Crisp Date Formatting
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    };
    
    updateTime();
    setInterval(updateTime, 1000); // Ticks every second for real-time accuracy
};

LifeOS.fetchWeather = function() {
    const weatherEl = document.getElementById('weather-display');
    // Prototype Baseline: Localized fallback data. 
    // Easily hook up to a free client geolocation API string here.
    weatherEl.textContent = "21°C"; 
};

/* ==========================================================================
   2. CORE ROUTING & UI INTERACTION HANDLERS
   ========================================================================== */
LifeOS.bindGlobalEvents = function() {
    const triangleBtn = document.getElementById('triangle-toggle-btn');
    const pillMenu = document.getElementById('tool-pill-menu');
    const universalBtn = document.getElementById('universal-board-btn');
    const universalDrawer = document.getElementById('universal-board-drawer');
    const voiceAnchorBtn = document.getElementById('voice-anchor-btn');
    const chatPanel = document.getElementById('chat-interface-panel');
    const minimizeChatBtn = document.getElementById('minimize-chat');
    const trashZone = document.getElementById('global-trash-dropzone');

    // --- Triangle Navigation Switcher Mechanics ---
    triangleBtn.addEventListener('click', () => {
        this.state.isNavOpen = !this.state.isNavOpen;
        triangleBtn.classList.toggle('active', this.state.isNavOpen);
        pillMenu.classList.toggle('hidden', !this.state.isNavOpen);
    });

    // Handle View Mutation Switches via Pills
    document.querySelectorAll('.tool-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const targetView = e.target.getAttribute('data-target');
            this.switchView(targetView);
            
            // Re-align pill visual active highlights
            document.querySelectorAll('.tool-pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            
            // Instantly contract navigation ring on selection
            this.state.isNavOpen = false;
            triangleBtn.classList.remove('active');
            pillMenu.classList.add('hidden');
        });
    });

    // --- Universal Board Visibility Trigger ---
    universalBtn.addEventListener('click', () => {
        this.state.isUniversalBoardOpen = !this.state.isUniversalBoardOpen;
        universalDrawer.classList.toggle('hidden', !this.state.isUniversalBoardOpen);
    });

    // --- Persistent Chat Window View Layer Toggle ---
    voiceAnchorBtn.addEventListener('click', (e) => {
        // Prevent event firing overlap during mouse click drag cycles
        if (voiceAnchorBtn.classList.contains('is-dragging')) return;
        this.state.isChatOpen = !this.state.isChatOpen;
        chatPanel.classList.toggle('hidden', !this.state.isChatOpen);
    });

    minimizeChatBtn.addEventListener('click', () => {
        this.state.isChatOpen = false;
        chatPanel.classList.add('hidden');
    });

    // --- HTML5 Native Drag & Drop Destruction Engine ---
    trashZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        trashZone.classList.add('drag-over');
    });

    trashZone.addEventListener('dragleave', () => {
        trashZone.classList.remove('drag-over');
    });

    trashZone.addEventListener('drop', (e) => {
        e.preventDefault();
        trashZone.classList.remove('drag-over');
        const cardId = e.dataTransfer.getData('text/plain');
        if (cardId) {
            this.deleteCard(cardId);
        }
    });

    // Setup voice module dragging hook
    this.setupDraggableVoiceWidget();
};

LifeOS.switchView = function(viewName) {
    // Hide previous state panel
    const currentActiveState = document.querySelector('.app-state.active');
    if (currentActiveState) currentActiveState.classList.remove('active');

    // Activate selected target state backdrop layout
    const targetState = document.getElementById(`state-${viewName}`);
    if (targetState) {
        targetState.classList.add('active');
        this.state.currentView = viewName;
    }
};

/* ==========================================================================
   3. DATA MUTATION LAYERS & PERSISTENCE
   ========================================================================== */
LifeOS.renderHomeDashboard = function() {
    const nextUpList = document.getElementById('next-up-list');
    const recentUpdatesList = document.getElementById('recent-updates-list');
    
    // Clear out container viewports
    nextUpList.innerHTML = '';
    recentUpdatesList.innerHTML = '';

    // Filter down to the exactly 3 high-priority urgent slots
    const activeCards = this.cards.filter(c => c.status === 'active');
    const nextUpCards = activeCards.slice(0, 3);

    if (nextUpCards.length === 0) {
        nextUpList.innerHTML = `<div class="empty-state-notice">System state clear. No upcoming tasks.</div>`;
    } else {
        nextUpCards.forEach(card => {
            const cardEl = this.createMinimalFeedItem(card);
            nextUpList.appendChild(cardEl);
        });
    }

    // Pull recent additions array elements
    const recentCards = [...this.cards].sort((a,b) => b.createdAt - a.createdAt).slice(0, 5);
    if (recentCards.length === 0) {
        recentUpdatesList.innerHTML = `<div class="empty-state-notice">No updates recorded in database.</div>`;
    } else {
        recentCards.forEach(card => {
            const updateItem = document.createElement('div');
            updateItem.className = 'update-feed-row';
            updateItem.innerHTML = `<strong>${card.source}</strong>: ${card.content.substring(0, 35)}...`;
            recentUpdatesList.appendChild(updateItem);
        });
    }
};

LifeOS.createMinimalFeedItem = function(card) {
    const el = document.createElement('div');
    el.className = 'feed-card-item';
    el.draggable = true;
    el.setAttribute('data-id', card.id);
    el.innerHTML = `<span>${card.content}</span><small class="tag-${card.type}">${card.type}</small>`;
    
    el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
    });
    
    return el;
};

LifeOS.deleteCard = function(id) {
    this.cards = this.cards.filter(c => c.id !== id);
    localStorage.setItem('lifeos_cards', JSON.stringify(this.cards));
    
    // Trigger real-time visual system state updates
    this.renderHomeDashboard();
};

/* ==========================================================================
   4. PERIPHERAL ACCELERATION HOOKS (DRAG RIGS)
   ========================================================================== */
LifeOS.setupDraggableVoiceWidget = function() {
    const widget = document.getElementById('voice-cognitive-shell');
    const trigger = document.getElementById('voice-anchor-btn');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    trigger.addEventListener('mousedown', (e) => {
        isDragging = true;
        trigger.classList.remove('is-dragging');
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = widget.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        // Temporarily clear centered positioning rules
        widget.style.left = initialX + 'px';
        widget.style.bottom = 'auto';
        widget.style.top = initialY + 'px';
        widget.style.transform = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        trigger.classList.add('is-dragging');
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        widget.style.left = (initialX + dx) + 'px';
        widget.style.top = (initialY + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        setTimeout(() => { trigger.classList.remove('is-dragging'); }, 50);
        isDragging = false;
    });
};
