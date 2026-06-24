/* ==========================================================================
   LIFEOS APPLICATION ARCHITECTURE ENGINE CORE
   ========================================================================== */

const LifeOS = {
    state: {
        currentView: 'home',
        isNavOpen: false,
        isUniversalOpen: false,
        isChatOpen: false
    },
    cards: JSON.parse(localStorage.getItem('lifeos_cards')) || [],

    init() {
        this.clockEngine();
        this.bindEvents();
        this.renderAllCanvases();
        this.renderHomeFeeds();
    },

    clockEngine() {
        const clock = document.getElementById('digital-clock');
        const dateEl = document.getElementById('current-date');
        const weather = document.getElementById('weather-display');
        
        const tick = () => {
            const now = new Date();
            clock.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
            dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        };
        tick();
        setInterval(tick, 1000);
        weather.textContent = "18°C"; 
    },

    bindEvents() {
        // --- Brand click Home Routing ---
        document.getElementById('brand-home-trigger').addEventListener('click', () => {
            this.switchView('home');
        });

        // --- Triangle Toggle Navigation ---
        const triangleBtn = document.getElementById('triangle-toggle-btn');
        const pillMenu = document.getElementById('tool-pill-menu');
        triangleBtn.addEventListener('click', () => {
            this.state.isNavOpen = !this.state.isNavOpen;
            triangleBtn.classList.toggle('active', this.state.isNavOpen);
            pillMenu.classList.toggle('hidden', !this.state.isNavOpen);
        });

        // --- Navigation Switcher Routing ---
        document.querySelectorAll('.tool-pill, .tool-house-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.switchView(target);
                
                document.querySelectorAll('.tool-pill, .tool-house-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Retract menu immediately upon tool swap routing
                this.state.isNavOpen = false;
                triangleBtn.classList.remove('active');
                pillMenu.classList.add('hidden');
            });
        });

        // --- Hamburger Settings Pop-out Menu Module ---
        const settingsTrigger = document.getElementById('settings-trigger');
        const settingsMenu = document.getElementById('settings-hamburger-menu');
        settingsTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', () => settingsMenu.classList.add('hidden'));

        // --- Hamburger Actions Setup ---
        document.getElementById('setting-download').addEventListener('click', () => this.downloadBackup());
        document.getElementById('setting-reset').addEventListener('click', () => this.systemReset());
        document.getElementById('setting-transfer').addEventListener('click', () => {
            document.getElementById('sync-modal').classList.remove('hidden');
        });
        document.getElementById('confirm-sync-btn').addEventListener('click', () => {
            document.getElementById('sync-modal').classList.add('hidden');
        });

        // --- Universal Board Visibility Trigger ---
        document.getElementById('universal-board-btn').addEventListener('click', () => {
            this.state.isUniversalOpen = !this.state.isUniversalOpen;
            document.getElementById('universal-board-drawer').classList.toggle('hidden', !this.state.isUniversalOpen);
        });

        // --- Global Creation Buttons Hook ---
        document.querySelectorAll('.create-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.getAttribute('data-tool');
                this.createNewBlankCard(tool);
            });
        });

        // --- Persistent Chat Window Toggle Layers ---
        const voiceAnchorBtn = document.getElementById('voice-anchor-btn');
        const chatPanel = document.getElementById('chat-interface-panel');
        voiceAnchorBtn.addEventListener('click', () => {
            if (voiceAnchorBtn.classList.contains('is-dragging')) return;
            this.state.isChatOpen = !this.state.isChatOpen;
            chatPanel.classList.toggle('hidden', !this.state.isChatOpen);
        });
        document.getElementById('minimize-chat').addEventListener('click', () => {
            this.state.isChatOpen = false;
            chatPanel.classList.add('hidden');
        });

        // --- HTML5 Native Drag & Drop Trash Destruction Mechanics ---
        const trashZone = document.getElementById('global-trash-dropzone');
        trashZone.addEventListener('dragover', (e) => { e.preventDefault(); trashZone.classList.add('drag-over'); });
        trashZone.addEventListener('dragleave', () => trashZone.classList.remove('drag-over'));
        trashZone.addEventListener('drop', (e) => {
            e.preventDefault();
            trashZone.classList.remove('drag-over');
            const cardId = e.dataTransfer.getData('text/plain');
            if (cardId) this.deleteCard(cardId);
        });

        this.setupDraggableVoice();
    },

    switchView(viewName) {
        const currentActive = document.querySelector('.app-state.active');
        if (currentActive) currentActive.classList.remove('active');
        
        const targetState = document.getElementById(`state-${viewName}`);
        if (targetState) {
            targetState.classList.add('active');
            this.state.currentView = viewName;
        }
        
        // Sync active highlighting states manually on root triggers
        document.querySelectorAll('.tool-pill, .tool-house-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-target') === viewName);
        });
    },

    createNewBlankCard(sourceTool) {
        const newCard = {
            id: 'card_' + Date.now(),
            type: sourceTool === 'Boardly' ? 'goal' : 'task', // Fallback defaults
            content: '',
            source: sourceTool,
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.cards.push(newCard);
        this.saveStateToStorage();
        this.renderAllCanvases();
        this.renderHomeFeeds();
    },

    deleteCard(id) {
        this.cards = this.cards.filter(c => c.id !== id);
        this.saveStateToStorage();
        this.renderAllCanvases();
        this.renderHomeFeeds();
    },

    saveStateToStorage() {
        localStorage.setItem('lifeos_cards', JSON.stringify(this.cards));
    },

    renderAllCanvases() {
        const tools = ['Taskly', 'Boardly', 'Timely', 'Brainly', 'Universal'];
        tools.forEach(tool => {
            const canvas = document.getElementById(`${tool.toLowerCase()}-canvas`) || document.getElementById('universal-card-scroller');
            if (!canvas) return;
            canvas.innerHTML = '';
            
            const toolCards = this.cards.filter(c => c.source === tool || (tool === 'Universal' && c.source === 'Universal'));
            toolCards.forEach(card => {
                const widget = this.buildCardUIElement(card);
                canvas.appendChild(widget);
            });
        });
    },

    buildCardUIElement(card) {
        const widget = document.createElement('div');
        widget.className = `universal-card-widget type-${card.type}`;
        widget.draggable = true;
        
        const txt = document.createElement('textarea');
        txt.className = 'card-editable-area';
        txt.placeholder = 'Type entry content...';
        txt.value = card.content;
        
        txt.addEventListener('input', (e) => {
            card.content = e.target.value;
            card.updatedAt = Date.now();
            LifeOS.saveStateToStorage();
            LifeOS.renderHomeFeeds();
        });

        widget.appendChild(txt);

        // Control strip layer 
        const controlRow = document.createElement('div');
        controlRow.className = 'card-control-row';
        
        // Multi-state design tokens cycler specific to Boardly
        if (card.source === 'Boardly') {
            const cycler = document.createElement('button');
            cycler.className = 'card-cycle-btn';
            
            const renderCycleLabel = (type) => {
                if (type === 'goal') return '🎯 Goal';
                if (type === 'note') return '✏️ Note';
                return '✅ Task';
            };
            
            cycler.textContent = renderCycleLabel(card.type);
            cycler.addEventListener('click', () => {
                if (card.type === 'goal') card.type = 'note';
                else if (card.type === 'note') card.type = 'task';
                else card.type = 'goal';
                
                widget.className = `universal-card-widget type-${card.type}`;
                cycler.textContent = renderCycleLabel(card.type);
                LifeOS.saveStateToStorage();
            });
            controlRow.appendChild(cycler);
        }

        widget.appendChild(controlRow);

        widget.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.id);
        });

        return widget;
    },

    renderHomeFeeds() {
        const nextUp = document.getElementById('next-up-list');
        const recent = document.getElementById('recent-updates-list');
        if (!nextUp || !recent) return;

        nextUp.innerHTML = ''; recent.innerHTML = '';

        const active = this.cards.filter(c => c.content.trim() !== '');
        const topThree = active.slice(0, 3);
        
        if (topThree.length === 0) {
            nextUp.innerHTML = '<div style="font-size:13px; color:rgba(255,255,255,0.6)">Workspace empty. Create a card inside your tools.</div>';
        } else {
            topThree.forEach(c => {
                const item = document.createElement('div');
                item.style.padding = '10px'; item.style.background = 'rgba(255,255,255,0.1)'; item.style.borderRadius = '8px';
                item.style.fontSize = '13px';
                item.innerHTML = `<strong>[${c.source}]</strong> ${c.content.substring(0,60)}`;
                nextUp.appendChild(item);
            });
        }

        const updates = [...this.cards].sort((a,b) => b.updatedAt - a.updatedAt).slice(0, 5);
        if (updates.length === 0) {
            recent.innerHTML = '<div style="font-size:13px; color:rgba(255,255,255,0.6)">No logged events.</div>';
        } else {
            updates.forEach(c => {
                const item = document.createElement('div');
                item.style.fontSize = '12px'; item.style.opacity = '0.85';
                item.innerHTML = `Updated data element in <strong>${c.source}</strong>`;
                recent.appendChild(item);
            });
        }
    },

    downloadBackup() {
        const blob = new Blob([JSON.stringify(this.cards, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'lifeos_system_backup.json';
        a.click();
    },

    systemReset() {
        if(confirm("Confirm hard storage wipe? All local state logs will be deleted.")) {
            localStorage.clear();
            location.reload();
        }
    },

    setupDraggableVoice() {
        const widget = document.getElementById('voice-cognitive-shell');
        const trigger = document.getElementById('voice-anchor-btn');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        trigger.addEventListener('mousedown', (e) => {
            isDragging = true;
            trigger.classList.remove('is-dragging');
            startX = e.clientX; startY = e.clientY;
            const rect = widget.getBoundingClientRect();
            initialX = rect.left; initialY = rect.top;
            widget.style.left = initialX + 'px';
            widget.style.bottom = 'auto'; widget.style.top = initialY + 'px'; widget.style.transform = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            trigger.classList.add('is-dragging');
            widget.style.left = (initialX + (e.clientX - startX)) + 'px';
            widget.style.top = (initialY + (e.clientY - startY)) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            setTimeout(() => { trigger.classList.remove('is-dragging'); }, 50);
            isDragging = false;
        });
    }
};

document.addEventListener('DOMContentLoaded', () => LifeOS.init());
