// Mind Map Wizard Application
class MindMapWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.problemStatement = '';
        this.selectedFramework = null;
        this.mindMapData = null;
        this.selectedNode = null;
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        
        // Framework data from JSON
        this.frameworks = [
            {
                id: "root-cause",
                name: "Root Cause Analysis (5 Whys)",
                description: "Drill down to the root cause by asking 'why' five times in succession",
                structure: ["Why 1?", "Why 2?", "Why 3?", "Why 4?", "Why 5?"],
                color: "#FF6B6B",
                example: "Problem: Low website conversion → Why 1: Complex checkout → Why 2: Too many steps → Why 3: No guest checkout → Why 4: Privacy concerns → Why 5: Unclear privacy policy"
            },
            {
                id: "swot",
                name: "SWOT Analysis",
                description: "Analyze Strengths, Weaknesses, Opportunities, and Threats",
                structure: ["Strengths", "Weaknesses", "Opportunities", "Threats"],
                color: "#4ECDC4",
                example: "Problem: Launching new product → Strengths: Strong brand → Weaknesses: Limited budget → Opportunities: Growing market → Threats: Competitors"
            },
            {
                id: "creative-problem-solving",
                name: "Creative Problem Solving",
                description: "Systematic approach combining divergent and convergent thinking",
                structure: ["Problem Clarification", "Idea Generation", "Solution Development", "Implementation Planning"],
                color: "#45B7D1",
                example: "Problem: Team communication → Clarify: Remote work challenges → Generate: Video calls, chat tools → Develop: Hybrid approach → Implement: Tool rollout plan"
            },
            {
                id: "design-thinking",
                name: "Design Thinking",
                description: "Human-centered approach to innovation and problem solving",
                structure: ["Empathize", "Define", "Ideate", "Prototype", "Test"],
                color: "#96CEB4",
                example: "Problem: Poor user experience → Empathize: User interviews → Define: Pain points → Ideate: Solutions → Prototype: Mockups → Test: User feedback"
            },
            {
                id: "issue-tree",
                name: "Issue Tree",
                description: "Break down complex problems into manageable components",
                structure: ["Primary Issues", "Secondary Issues", "Specific Problems", "Action Items"],
                color: "#FFEAA7",
                example: "Problem: Declining sales → Primary: Market factors → Secondary: Competition, pricing → Specific: Price sensitivity → Action: Market research"
            }
        ];

        this.suggestions = {
            "root-cause": {
                "Why 1?": ["What immediate cause led to this problem?", "What directly contributed to this issue?", "What was the trigger event?"],
                "Why 2?": ["What systemic issue caused that?", "What process breakdown occurred?", "What resource was lacking?"],
                "Why 3?": ["What policy or procedure failed?", "What training was missing?", "What communication broke down?"],
                "Why 4?": ["What organizational factor contributed?", "What cultural issue exists?", "What system design flaw exists?"],
                "Why 5?": ["What fundamental assumption is wrong?", "What core value is misaligned?", "What foundational element is missing?"]
            },
            "swot": {
                "Strengths": ["What advantages do you have?", "What do you do well?", "What unique resources do you possess?", "What do others see as your strengths?"],
                "Weaknesses": ["What could you improve?", "What do you do poorly?", "What should you avoid?", "What disadvantages do you face?"],
                "Opportunities": ["What opportunities exist?", "What trends could benefit you?", "How can you turn strengths into opportunities?", "What changes create openings?"],
                "Threats": ["What threats could harm you?", "What challenges do you face?", "What could competitors do?", "What obstacles exist?"]
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderFrameworks();
        this.updateUI();
        this.loadSavedData();
    }

    setupEventListeners() {
        // Navigation
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextStep();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevStep();
            });
        }

        // Step 1: Problem input
        const problemInput = document.getElementById('problem-input');
        if (problemInput) {
            problemInput.addEventListener('input', (e) => {
                this.problemStatement = e.target.value.trim();
                this.updateNextButton();
            });
        }

        // Example cards - wait for DOM to be ready
        setTimeout(() => {
            document.querySelectorAll('.example-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const example = card.dataset.example;
                    const problemInput = document.getElementById('problem-input');
                    if (problemInput && example) {
                        problemInput.value = example;
                        this.problemStatement = example;
                        this.updateNextButton();
                        // Add visual feedback
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            card.style.transform = '';
                        }, 150);
                    }
                });
            });
        }, 100);

        // Mind map controls
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetZoomBtn = document.getElementById('reset-zoom');
        const zoomIn2Btn = document.getElementById('zoom-in-2');
        const zoomOut2Btn = document.getElementById('zoom-out-2');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());
        if (resetZoomBtn) resetZoomBtn.addEventListener('click', () => this.resetZoom());
        if (zoomIn2Btn) zoomIn2Btn.addEventListener('click', () => this.zoomIn(2));
        if (zoomOut2Btn) zoomOut2Btn.addEventListener('click', () => this.zoomOut(2));

        // Node editing
        const addNodeBtn = document.getElementById('add-node');
        const deleteNodeBtn = document.getElementById('delete-node');
        
        if (addNodeBtn) addNodeBtn.addEventListener('click', () => this.addNode());
        if (deleteNodeBtn) deleteNodeBtn.addEventListener('click', () => this.deleteNode());

        // Modal controls
        const closeModalBtn = document.getElementById('close-modal');
        const cancelEditBtn = document.getElementById('cancel-edit');
        const saveEditBtn = document.getElementById('save-edit');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => this.closeModal());
        if (saveEditBtn) saveEditBtn.addEventListener('click', () => this.saveNodeEdit());

        // Export controls
        const exportPngBtn = document.getElementById('export-png');
        const exportJsonBtn = document.getElementById('export-json');
        const saveLocalBtn = document.getElementById('save-local');
        const printViewBtn = document.getElementById('print-view');
        
        if (exportPngBtn) exportPngBtn.addEventListener('click', () => this.exportPNG());
        if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportJSON());
        if (saveLocalBtn) saveLocalBtn.addEventListener('click', () => this.saveToLocal());
        if (printViewBtn) printViewBtn.addEventListener('click', () => this.printView());
    }

    renderFrameworks() {
        const grid = document.getElementById('frameworks-grid');
        if (!grid) return;

        grid.innerHTML = this.frameworks.map(framework => `
            <div class="framework-card" data-framework="${framework.id}" style="--framework-color: ${framework.color}">
                <h3>${framework.name}</h3>
                <p class="framework-description">${framework.description}</p>
                <div class="framework-structure">
                    <h4>Structure:</h4>
                    <ul class="structure-list">
                        ${framework.structure.map(item => `<li class="structure-item">${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="framework-example">
                    <strong>Example:</strong> ${framework.example}
                </div>
            </div>
        `).join('');

        // Add click handlers for framework selection
        setTimeout(() => {
            document.querySelectorAll('.framework-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Remove previous selection
                    document.querySelectorAll('.framework-card').forEach(c => c.classList.remove('selected'));
                    // Select current card
                    card.classList.add('selected');
                    // Find and set selected framework
                    const frameworkId = card.dataset.framework;
                    this.selectedFramework = this.frameworks.find(f => f.id === frameworkId);
                    this.updateNextButton();
                    
                    // Add visual feedback
                    card.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        card.style.transform = '';
                    }, 150);
                });
            });
        }, 100);
    }

    nextStep() {
        console.log('Next step called, current step:', this.currentStep);
        
        // Validate current step
        if (!this.validateStep()) {
            console.log('Step validation failed');
            return;
        }

        if (this.currentStep < this.totalSteps) {
            // Process step transition before moving
            this.processStep();
            
            // Move to next step
            this.currentStep++;
            console.log('Moving to step:', this.currentStep);
            
            // Update UI
            this.updateUI();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    validateStep() {
        switch (this.currentStep) {
            case 1:
                const isValid = this.problemStatement && this.problemStatement.trim().length > 0;
                console.log('Step 1 validation:', isValid, 'Problem:', this.problemStatement);
                return isValid;
            case 2:
                console.log('Step 2 validation:', this.selectedFramework !== null, 'Framework:', this.selectedFramework);
                return this.selectedFramework !== null;
            default:
                return true;
        }
    }

    processStep() {
        console.log('Processing step:', this.currentStep);
        switch (this.currentStep) {
            case 2:
                // Moving from step 2 to 3 - generate mind map
                setTimeout(() => this.generateMindMap(), 100);
                break;
            case 3:
                // Moving from step 3 to 4 - setup editable map
                setTimeout(() => this.setupEditableMap(), 100);
                break;
            case 4:
                // Moving from step 4 to 5 - render final map
                setTimeout(() => this.renderFinalMap(), 100);
                break;
        }
    }

    generateMindMap() {
        console.log('Generating mind map for framework:', this.selectedFramework);
        if (!this.selectedFramework) return;

        const centerX = 400;
        const centerY = 250;
        const radius = 150;

        this.mindMapData = {
            nodes: [{
                id: 'center',
                text: this.problemStatement.length > 50 ? 
                      this.problemStatement.substring(0, 47) + '...' : 
                      this.problemStatement,
                x: centerX,
                y: centerY,
                color: this.selectedFramework.color,
                type: 'central',
                level: 0
            }],
            links: []
        };

        // Add framework-specific nodes
        this.selectedFramework.structure.forEach((item, index) => {
            const angle = (index * 2 * Math.PI) / this.selectedFramework.structure.length;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const nodeId = `node-${index}`;
            this.mindMapData.nodes.push({
                id: nodeId,
                text: item,
                x: x,
                y: y,
                color: this.selectedFramework.color,
                type: 'branch',
                level: 1,
                parentId: 'center'
            });

            this.mindMapData.links.push({
                source: 'center',
                target: nodeId
            });
        });

        // Render the mind map
        setTimeout(() => this.renderMindMap('mind-map-svg'), 100);
    }

    renderMindMap(svgId) {
        const svg = document.getElementById(svgId);
        console.log('Rendering mind map to:', svgId, 'SVG element:', svg);
        if (!svg || !this.mindMapData) return;

        svg.innerHTML = '';

        // Create groups for links and nodes
        const linksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        linksGroup.setAttribute('class', 'links-group');
        nodesGroup.setAttribute('class', 'nodes-group');

        // Render links
        this.mindMapData.links.forEach(link => {
            const sourceNode = this.mindMapData.nodes.find(n => n.id === link.source);
            const targetNode = this.mindMapData.nodes.find(n => n.id === link.target);
            
            if (sourceNode && targetNode) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = this.createCurvedPath(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
                
                path.setAttribute('d', d);
                path.setAttribute('class', 'mind-map-link');
                linksGroup.appendChild(path);
            }
        });

        // Render nodes
        this.mindMapData.nodes.forEach(node => {
            const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            nodeGroup.setAttribute('class', `mind-map-node ${node.type === 'central' ? 'central-node' : ''}`);
            nodeGroup.setAttribute('data-node-id', node.id);

            // Node circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', node.type === 'central' ? 30 : 20);
            circle.setAttribute('class', 'node-circle');
            circle.style.setProperty('--node-color', node.color);

            // Node text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.setAttribute('class', 'node-text');
            text.textContent = this.truncateText(node.text, node.type === 'central' ? 20 : 15);

            nodeGroup.appendChild(circle);
            nodeGroup.appendChild(text);

            // Add click handler for editing
            if (svgId === 'mind-map-svg-2') {
                nodeGroup.addEventListener('click', () => this.selectNode(node.id));
            }

            nodesGroup.appendChild(nodeGroup);
        });

        svg.appendChild(linksGroup);
        svg.appendChild(nodesGroup);
    }

    createCurvedPath(x1, y1, x2, y2) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const offset = distance * 0.2;

        // Calculate perpendicular offset for curve
        const perpX = -(y2 - y1) / distance * offset;
        const perpY = (x2 - x1) / distance * offset;

        return `M ${x1} ${y1} Q ${midX + perpX} ${midY + perpY} ${x2} ${y2}`;
    }

    setupEditableMap() {
        this.renderMindMap('mind-map-svg-2');
        this.updateSuggestions();
    }

    selectNode(nodeId) {
        // Clear previous selection
        document.querySelectorAll('.mind-map-node').forEach(node => {
            node.classList.remove('selected');
        });

        // Select new node
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.classList.add('selected');
            this.selectedNode = this.mindMapData.nodes.find(n => n.id === nodeId);
            
            // Update delete button state
            const deleteBtn = document.getElementById('delete-node');
            if (deleteBtn) {
                deleteBtn.disabled = this.selectedNode?.type === 'central';
            }

            // Show suggestions for this node
            this.updateSuggestions();

            // Double click to edit
            nodeElement.addEventListener('dblclick', () => this.openEditModal());
        }
    }

    openEditModal() {
        if (!this.selectedNode) return;

        const modal = document.getElementById('edit-node-modal');
        const nodeText = document.getElementById('node-text');
        const nodeColor = document.getElementById('node-color');

        if (nodeText) nodeText.value = this.selectedNode.text;
        if (nodeColor) nodeColor.value = this.selectedNode.color;

        if (modal) modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('edit-node-modal');
        if (modal) modal.classList.add('hidden');
    }

    saveNodeEdit() {
        if (!this.selectedNode) return;

        const nodeText = document.getElementById('node-text');
        const nodeColor = document.getElementById('node-color');
        
        const newText = nodeText?.value.trim();
        const newColor = nodeColor?.value;

        if (newText) {
            this.selectedNode.text = newText;
            if (newColor) this.selectedNode.color = newColor;
            this.renderMindMap('mind-map-svg-2');
            this.closeModal();
        }
    }

    addNode() {
        if (!this.selectedNode) {
            alert('Please select a parent node first');
            return;
        }

        const newId = 'node-' + Date.now();
        const parentNode = this.selectedNode;
        
        // Calculate position for new node
        const angle = Math.random() * 2 * Math.PI;
        const radius = 80;
        const x = parentNode.x + Math.cos(angle) * radius;
        const y = parentNode.y + Math.sin(angle) * radius;

        const newNode = {
            id: newId,
            text: 'New Node',
            x: x,
            y: y,
            color: parentNode.color,
            type: 'branch',
            level: parentNode.level + 1,
            parentId: parentNode.id
        };

        this.mindMapData.nodes.push(newNode);
        this.mindMapData.links.push({
            source: parentNode.id,
            target: newId
        });

        this.renderMindMap('mind-map-svg-2');
    }

    deleteNode() {
        if (!this.selectedNode || this.selectedNode.type === 'central') return;

        // Remove node and its children
        const nodesToRemove = [this.selectedNode.id];
        const linksToRemove = [];

        // Find all child nodes recursively
        const findChildren = (parentId) => {
            this.mindMapData.nodes.forEach(node => {
                if (node.parentId === parentId) {
                    nodesToRemove.push(node.id);
                    findChildren(node.id);
                }
            });
        };

        findChildren(this.selectedNode.id);

        // Remove links
        this.mindMapData.links = this.mindMapData.links.filter(link => 
            !nodesToRemove.includes(link.source) && !nodesToRemove.includes(link.target)
        );

        // Remove nodes
        this.mindMapData.nodes = this.mindMapData.nodes.filter(node => 
            !nodesToRemove.includes(node.id)
        );

        this.selectedNode = null;
        this.renderMindMap('mind-map-svg-2');
        
        const deleteBtn = document.getElementById('delete-node');
        if (deleteBtn) deleteBtn.disabled = true;
    }

    updateSuggestions() {
        const suggestionsContent = document.getElementById('suggestions-content');
        if (!suggestionsContent || !this.selectedNode || !this.selectedFramework) return;

        const frameworkSuggestions = this.suggestions[this.selectedFramework.id];
        if (!frameworkSuggestions) {
            suggestionsContent.innerHTML = '<p>No suggestions available for this framework</p>';
            return;
        }

        const nodeSuggestions = frameworkSuggestions[this.selectedNode.text];
        if (!nodeSuggestions) {
            suggestionsContent.innerHTML = '<p>Click on a framework node to see suggestions</p>';
            return;
        }

        suggestionsContent.innerHTML = nodeSuggestions.map(suggestion => 
            `<div class="suggestion-item">${suggestion}</div>`
        ).join('');

        // Add click handlers for suggestions
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                if (this.selectedNode) {
                    this.selectedNode.text = item.textContent;
                    this.renderMindMap('mind-map-svg-2');
                }
            });
        });
    }

    renderFinalMap() {
        this.renderMindMap('final-mind-map-svg');
    }

    zoomIn(canvasNumber = 1) {
        this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
        this.applyZoom(canvasNumber);
    }

    zoomOut(canvasNumber = 1) {
        this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
        this.applyZoom(canvasNumber);
    }

    resetZoom(canvasNumber = 1) {
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.applyZoom(canvasNumber);
    }

    applyZoom(canvasNumber) {
        const svgId = canvasNumber === 2 ? 'mind-map-svg-2' : 'mind-map-svg';
        const svg = document.getElementById(svgId);
        if (svg) {
            const transform = `scale(${this.zoomLevel}) translate(${this.panOffset.x}px, ${this.panOffset.y}px)`;
            svg.style.transform = transform;
        }
    }

    exportPNG() {
        const svg = document.getElementById('final-mind-map-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = 800;
        canvas.height = 600;

        img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            const link = document.createElement('a');
            link.download = 'mindmap.png';
            link.href = canvas.toDataURL();
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }

    exportJSON() {
        const data = {
            problem: this.problemStatement,
            framework: this.selectedFramework,
            mindMap: this.mindMapData,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'mindmap-data.json';
        link.href = URL.createObjectURL(blob);
        link.click();
    }

    saveToLocal() {
        const data = {
            problem: this.problemStatement,
            framework: this.selectedFramework,
            mindMap: this.mindMapData,
            step: this.currentStep,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('mindmap-wizard-data', JSON.stringify(data));
        alert('Mind map saved to browser storage!');
    }

    loadSavedData() {
        const saved = localStorage.getItem('mindmap-wizard-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.problemStatement = data.problem || '';
                this.selectedFramework = data.framework;
                this.mindMapData = data.mindMap;
                
                // Restore UI state
                const problemInput = document.getElementById('problem-input');
                if (problemInput) problemInput.value = this.problemStatement;
                
                if (this.selectedFramework) {
                    setTimeout(() => {
                        const card = document.querySelector(`[data-framework="${this.selectedFramework.id}"]`);
                        if (card) card.classList.add('selected');
                    }, 100);
                }
            } catch (e) {
                console.warn('Failed to load saved data:', e);
            }
        }
    }

    printView() {
        const svg = document.getElementById('final-mind-map-svg');
        if (!svg) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Mind Map - ${this.problemStatement}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        h1 { text-align: center; margin-bottom: 20px; }
                        .svg-container { text-align: center; }
                        svg { max-width: 100%; height: auto; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    <h1>Mind Map: ${this.problemStatement}</h1>
                    <div class="svg-container">${svg.outerHTML}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    updateUI() {
        console.log('Updating UI for step:', this.currentStep);
        
        // Update progress
        this.updateProgress();
        
        // Show/hide steps
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            const shouldBeActive = index + 1 === this.currentStep;
            step.classList.toggle('active', shouldBeActive);
            console.log(`Step ${index + 1} active:`, shouldBeActive);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) prevBtn.disabled = this.currentStep === 1;
        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.totalSteps ? 'Finish' : 'Next';
        }
        
        this.updateNextButton();
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
            step.classList.toggle('completed', stepNumber < this.currentStep);
        });
    }

    updateNextButton() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            const canProceed = this.validateStep();
            nextBtn.disabled = !canProceed;
            console.log('Next button disabled:', !canProceed);
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Mind Map Wizard');
    new MindMapWizard();
});