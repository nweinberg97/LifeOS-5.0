/**
 * ==========================================================================
 * LIFEOS DATA ARCHITECTURE MATRIX & ROUTING MANAGEMENT CORE
 * ==========================================================================
 */

// Core Global Memory Pipeline Structure
const LifeOS_State = {
    cards: JSON.parse(localStorage.getItem('lifeos_cards')) || [],
    boards: JSON.parse(localStorage.getItem('lifeos_boards')) || [
        { id: 'b1', name: 'Strategic Vision', color: '#007AFF' },
        { id: 'b2', name: 'Tactical Pipeline', color: '#34C759' }
    ],
    activeBoardId: 'b1',
    activeView: 'home',
    activeTimelyMode: 'schedule',
    activeTimelySubview: 'daily'
};

// Global Context Prioritization Stack Controller (Dynamic Z-Index)
const LayerManager = {
    topIndex: 2000,
    bringToFront(domElement) {
        if (!domElement) return;
        this.topIndex += 5;
        domElement.style.zIndex = this.topIndex;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ChronosEngine.init();
    InterfaceRouter.init();
    SettingsMenu.init();
    UniversalBoard.init();
    CardEngine.init();
    CognitiveAssistant.init();
});

/**
 * CHRONOS TIME ENGINE (Liquid Clock & Context Feed Data)
 */
const ChronosEngine = {
    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    },
    updateClock() {
        const now = new Date();
        const clockEl = document.getElementById('clock-display');
        const contextEl = document.getElementById('date-weather-display');
        
        if (clockEl) {
            clockEl.textContent = now.toTimeString().split(' ')[0];
        }
        
        if (contextEl) {
            const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
            // Static weather metrics matching Kitsilano regional profiles
            contextEl.textContent = `${now.toLocaleDateString('en-US', options)} — Vancouver, BC • 18°C Sunny`;
        }
    }
};

/**
 * INTERFACE ROUTER (Global Workspace Routing Mechanics)
 */
const InterfaceRouter = {
    init() {
        // Brand home reset link handler
        document.getElementById('brand-home-trigger').addEventListener('click', () => this.switchView('home'));
        
        // Far Right Triangle Expansion Launcher Mechanic
        const triangleTrigger = document.getElementById('triangle-menu-trigger');
        const verticalMenu = document.getElementById('vertical-tool-menu');
        
        triangleTrigger.addEventListener('click', () => {
            verticalMenu.classList.toggle('hidden');
            if (verticalMenu.classList.contains('hidden')) {
                triangleTrigger.textContent = '◀';
            } else {
                triangleTrigger.textContent = '▶';
            }
        });

        // View pills click intercept routing
        document.querySelectorAll('.tool-pill-btn, .tool-house-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetView = e.currentTarget.getAttribute('data-target');
                this.switchView(targetView);
                
                // Set highlighting context rules on right edge menu pills
                document.querySelectorAll('.tool-pill-btn, .tool-house-btn').forEach(b => b.classList.remove('active-indicator', 'active'));
                if (e.currentTarget.classList.contains('tool-pill-btn')) {
                    e.currentTarget.classList.add('active-indicator');
                } else {
                    e.currentTarget.classList.add('active');
                }
            });
        });
    },
    switchView(viewId) {
        LifeOS_State.activeView = viewId;
        document.querySelectorAll('.workspace-view').forEach(view => {
            view.classList.remove('visible');
            view.classList.add('hidden');
        });
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('visible');
        }
        CardEngine.renderAll();
    }
};

/**
 * SYSTEM SETTINGS UTILITIES DROP MATRIX
 */
const SettingsMenu = {
    init() {
        const trigger = document.getElementById('hamburger-trigger');
        const menu = document.getElementById('settings-menu');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
            LayerManager.bringToFront(menu);
        });

        document.addEventListener('click', () => menu.classList.add('hidden'));

        // Infrastructure Utilities Handshakes
        document.getElementById('btn-sync-device').addEventListener('click', () => {
            alert("Local Handshake Sequence Initiated. Mapping System Storage Token to 'iPhone 12'. Target Sync Established.");
        });

        document.getElementById('btn-download-data').addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LifeOS_State));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `lifeos_backup_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });

        document.getElementById('btn-storage-reset').addEventListener('click', () => {
            if (confirm("Execute Total Wipe Parameters? All browser localStorage will be flushed.")) {
                localStorage.clear();
                location.reload();
            }
        });
    }
};

/**
 * UNIVERSAL INBOX BOARD MECHANICS (Decoupled Top-Right Component)
 */
const UniversalBoard = {
    init() {
        const trigger = document.getElementById('universal-board-trigger');
        const panel = document.getElementById('universal-board-panel');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('hidden');
            if(!panel.classList.contains('hidden')) {
                LayerManager.bringToFront(document.getElementById('universal-container-root'));
            }
        });

        panel.addEventListener('mousedown', () => {
            LayerManager.bringToFront(document.getElementById('universal-container-root'));
        });
    }
};

/**
 * CARD MANIPULATION & INTERACTION CORE ENGINE (DRAG & DROP FOUNDATIONS)
 */
const CardEngine = {
    init() {
        this.setupGlobalTrashRoute();
        this.setupLocalCreationTriggers();
        this.renderAll();
    },
    setupLocalCreationTriggers() {
        const bindTrigger = (id, targetTool, statusField = '') => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', () => {
                    const newCard = {
                        id: 'card_' + Date.now(),
                        content: 'Double click to edit message core...',
                        tool: targetTool,
                        pipelineStatus: statusField,
                        boardId: LifeOS_State.activeBoardId,
                        order: 0
                    };
                    LifeOS_State.cards.push(newCard);
                    this.syncState();
                    this.renderAll();
                });
            }
        };

        bindTrigger('taskly-add-card', 'taskly', 'To Do');
        bindTrigger('boardly-add-card', 'boardly');
        bindTrigger('ub-add-card', 'universal');
        bindTrigger('brainly-add-note', 'brainly');
    },
    setupGlobalTrashRoute() {
        const trashZone = document.getElementById('global-trash-dropzone');
        
        trashZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            trashZone.classList.add('hover-active');
        });
        
        trashZone.addEventListener('dragleave', () => {
            trashZone.classList.remove('hover-active');
        });
        
        trashZone.addEventListener('drop', (e) => {
            e.preventDefault();
            trashZone.classList.remove('hover-active');
            const cardId = e.dataTransfer.getData('text/plain');
            LifeOS_State.cards = LifeOS_State.cards.filter(c => c.id !== cardId);
            this.syncState();
            this.renderAll();
        });
    },
    syncState() {
        localStorage.setItem('lifeos_cards', JSON.stringify(LifeOS_State.cards));
    },
    renderAll() {
        // Clear DOM layout containers before mapping
        document.querySelectorAll('.kanban-card-dropzone, #universal-cards-container, #boardly-canvas').forEach(el => el.innerHTML = '');
        
        // Split data loops to respective structural engines
        LifeOS_State.cards.forEach(card => {
            const cardElement = this.createDOMCardElement(card);
            
            if (card.tool === 'universal') {
                document.getElementById('universal-cards-container').appendChild(cardElement);
            } else if (card.tool === 'taskly' && LifeOS_State.activeView === 'taskly') {
                const targetZoneMap = {
                    'To Do': 'dz-todo', 'In Progress': 'dz-inprogress',
                    'Review': 'dz-review', 'Completed': 'dz-completed', 'Backlog': 'dz-backlog'
                };
                const dz = document.getElementById(targetZoneMap[card.pipelineStatus]);
                if (dz) dz.appendChild(cardElement);
            } else if (card.tool === 'boardly' && LifeOS_State.activeView === 'boardly' && card.boardId === LifeOS_State.activeBoardId) {
                document.getElementById('boardly-canvas').appendChild(cardElement);
            }
        });

        this.renderBoardlyTabs();
    },
    createDOMCardElement(card) {
        const el = document.createElement('div');
        el.className = 'life-card';
        el.setAttribute('draggable', 'true');
        el.id = card.id;

        const preview = document.createElement('div');
        preview.className = 'card-preview-line';
        preview.textContent = card.content;
        el.appendChild(preview);

        // Double Click Inline Edit Engine Protocol
        el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const originalText = card.content;
            el.innerHTML = '';
            const input = document.createElement('textarea');
            input.style.width = '100%';
            input.style.border = 'none';
            input.style.outline = 'none';
            input.value = originalText;
            el.appendChild(input);
            input.focus();

            const commitChanges = () => {
                card.content = input.value;
                CardEngine.syncState();
                CardEngine.renderAll();
            };

            input.addEventListener('blur', commitChanges);
            input.addEventListener('keydown', (e) => { if(e.key === 'Enter') commitChanges(); });
        });

        // HTML5 Drag Event Hooks Array Mapping
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.id);
            setTimeout(() => el.style.opacity = '0.4', 0);
        });

        el.addEventListener('dragend', () => {
            el.style.opacity = '1';
        });

        el.addEventListener('mousedown', () => LayerManager.bringToFront(el));

        return el;
    },
    renderBoardlyTabs() {
        const container = document.getElementById('boardly-tab-container');
        if (!container) return;
        container.innerHTML = '';

        LifeOS_State.boards.forEach(board => {
            const tab = document.createElement('div');
            tab.className = `boardly-tab ${board.id === LifeOS_State.activeBoardId ? 'active-board' : ''}`;
            
            const dot = document.createElement('span');
            dot.className = 'tab-dot';
            dot.style.backgroundColor = board.color;
            
            const label = document.createElement('span');
            label.textContent = board.name;

            tab.appendChild(dot);
            tab.appendChild(label);

            tab.addEventListener('click', () => {
                LifeOS_State.activeBoardId = board.id;
                this.renderAll();
            });

            // Inline Tab Renaming functionality via Double Click Event
            tab.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'text';
                input.value = board.name;
                tab.innerHTML = '';
                tab.appendChild(input);
                input.focus();

                input.addEventListener('blur', () => {
                    board.name = input.value;
                    localStorage.setItem('lifeos_boards', JSON.stringify(LifeOS_State.boards));
                    this.renderBoardlyTabs();
                });
            });

            container.appendChild(tab);
        });
    }
};

/**
 * COGNITIVE INTERFACE ASSISTANT & VOICE UI UTILITIES MAPPING
 */
const CognitiveAssistant = {
    init() {
        const bubble = document.getElementById('assistant-core-bubble');
        const panel = document.getElementById('chat-interface-panel');
        const close = document.getElementById('chat-close-trigger');
        
        // Open/Close toggle interface triggers
        bubble.addEventListener('click', () => {
            panel.classList.toggle('hidden');
            if(!panel.classList.contains('hidden')) {
                LayerManager.bringToFront(panel);
            }
        });
        
        close.addEventListener('click', () => panel.classList.add('hidden'));

        // Basic Native Draggable implementation for the core bubble position
        let isDragging = false;
        let offsetX, offsetY;

        bubble.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - bubble.getBoundingClientRect().left;
            offsetY = e.clientY - bubble.getBoundingClientRect().top;
            LayerManager.bringToFront(panel);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            bubble.style.left = `${e.clientX - offsetX + 28}px`; // Accommodate translation offset center
            bubble.style.top = `${e.clientY - offsetY + 28}px`;
            bubble.style.bottom = 'auto';
            bubble.style.transform = 'translate(-50%, -50%)';
        });

        document.addEventListener('mouseup', () => isDragging = false);
    }
};
