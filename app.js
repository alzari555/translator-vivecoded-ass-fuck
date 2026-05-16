document.addEventListener('DOMContentLoaded', () => {
    const DOM = {
        settingsBtn: document.getElementById('settingsBtn'),
        settingsDialog: document.getElementById('settingsDialog'),
        closeSettingsBtn: document.getElementById('closeSettingsBtn'),
        connectBtn: document.getElementById('connectBtn'),
        
        apiUrl: document.getElementById('apiUrl'),
        apiKey: document.getElementById('apiKey'),
        apiProviderPreset: document.getElementById('apiProviderPreset'),
        profileSelect: document.getElementById('profileSelect'),
        newProfileName: document.getElementById('newProfileName'),
        saveProfileBtn: document.getElementById('saveProfileBtn'),
        deleteProfileBtn: document.getElementById('deleteProfileBtn'),
        modelSelect: document.getElementById('modelSelect'),
        instructionMode: document.getElementById('instructionMode'),
        targetLang: document.getElementById('targetLang'),
        systemPromptSelect: document.getElementById('systemPromptSelect'),
        systemPromptContainer: document.getElementById('systemPromptContainer'),
        systemPrompt: document.getElementById('systemPrompt'),
        
        overlapSize: document.getElementById('overlapSize'),
        overlapValLabel: document.getElementById('overlapValLabel'),
        maxInputChars: document.getElementById('maxInputChars'),
        maxOutTokens: document.getElementById('maxOutTokens'),
        
        dropZone: document.getElementById('dropZone'),
        fileInput: document.getElementById('fileInput'),
        sourceText: document.getElementById('sourceText'),
        targetText: document.getElementById('targetText'),
        
        translateBtn: document.getElementById('translateBtn'),
        clearBtn: document.getElementById('clearBtn'),
        copyBtn: document.getElementById('copyBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingStatus: document.getElementById('loadingStatus'),
        progressContainer: document.getElementById('progressContainer'),
        progressBar: document.getElementById('progressBar'),
        cancelBtn: document.getElementById('cancelBtn')
    };

    let cancelTranslation = false;

    // Profile Management
    let profiles = JSON.parse(localStorage.getItem('translator_profiles'));
    
    // Migrate old settings if profiles don't exist yet
    if (!profiles) {
        profiles = {
            'default': {
                name: 'Por defecto',
                apiUrl: localStorage.getItem('apiUrl') || 'http://localhost:11434/v1',
                apiKey: '',
                apiProviderPreset: 'local',
                instructionMode: localStorage.getItem('instructionMode') || 'chat',
                targetLang: localStorage.getItem('targetLang') || 'español',
                systemPromptSelect: localStorage.getItem('systemPromptSelect') || 'translation',
                systemPrompt: localStorage.getItem('systemPrompt') || 'Translate the following text into {lang}. Provide only the translation, without any additional explanations, notes, or conversational text.',
                overlapSize: localStorage.getItem('overlapSize') || 10,
                maxInputChars: localStorage.getItem('maxInputChars') || 2048,
                maxOutTokens: localStorage.getItem('maxOutTokens') || 1024,
                selectedModel: localStorage.getItem('selectedModel') || 'local-model'
            }
        };
        localStorage.setItem('translator_profiles', JSON.stringify(profiles));
    }
    
    let currentProfileId = localStorage.getItem('current_profile_id') || 'default';
    if (!profiles[currentProfileId]) currentProfileId = 'default';

    function updateProfileSelect() {
        DOM.profileSelect.innerHTML = '';
        for (const [id, prof] of Object.entries(profiles)) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = prof.name;
            DOM.profileSelect.appendChild(opt);
        }
        DOM.profileSelect.value = currentProfileId;
    }

    function loadProfile(id) {
        const p = profiles[id];
        if (!p) return;
        currentProfileId = id;
        localStorage.setItem('current_profile_id', id);
        
        DOM.apiUrl.value = p.apiUrl || '';
        DOM.apiKey.value = p.apiKey || '';
        DOM.apiProviderPreset.value = p.apiProviderPreset || 'local';
        DOM.instructionMode.value = p.instructionMode || 'chat';
        DOM.targetLang.value = p.targetLang || 'español';
        DOM.systemPromptSelect.value = p.systemPromptSelect || 'translation';
        DOM.systemPrompt.value = p.systemPrompt || '';
        DOM.overlapSize.value = p.overlapSize || 10;
        DOM.overlapValLabel.textContent = DOM.overlapSize.value;
        DOM.maxInputChars.value = p.maxInputChars || 2048;
        DOM.maxOutTokens.value = p.maxOutTokens || 1024;
        
        localStorage.setItem('selectedModel', p.selectedModel || '');
        toggleSystemPrompt();
    }

    function saveCurrentProfile(name) {
        let id = currentProfileId;
        if (name) {
            id = 'prof_' + Date.now();
            profiles[id] = { name: name };
            currentProfileId = id;
            localStorage.setItem('current_profile_id', id);
        }
        
        profiles[id] = {
            name: profiles[id].name,
            apiUrl: DOM.apiUrl.value,
            apiKey: DOM.apiKey.value,
            apiProviderPreset: DOM.apiProviderPreset.value,
            instructionMode: DOM.instructionMode.value,
            targetLang: DOM.targetLang.value.trim(),
            systemPromptSelect: DOM.systemPromptSelect.value,
            systemPrompt: DOM.systemPrompt.value.trim(),
            overlapSize: DOM.overlapSize.value,
            maxInputChars: DOM.maxInputChars.value,
            maxOutTokens: DOM.maxOutTokens.value,
            selectedModel: DOM.modelSelect.value
        };
        
        localStorage.setItem('translator_profiles', JSON.stringify(profiles));
        updateProfileSelect();
    }

    // UI Listeners for Profiles
    DOM.profileSelect.addEventListener('change', (e) => loadProfile(e.target.value));
    
    DOM.saveProfileBtn.addEventListener('click', () => {
        const newName = DOM.newProfileName.value.trim();
        saveCurrentProfile(newName);
        DOM.newProfileName.value = '';
        alert('Perfil guardado correctamente.');
    });
    
    DOM.deleteProfileBtn.addEventListener('click', () => {
        if (currentProfileId === 'default') {
            alert('No puedes eliminar el perfil por defecto.');
            return;
        }
        if (confirm(`¿Eliminar el perfil "${profiles[currentProfileId].name}"?`)) {
            delete profiles[currentProfileId];
            localStorage.setItem('translator_profiles', JSON.stringify(profiles));
            currentProfileId = 'default';
            updateProfileSelect();
            loadProfile('default');
        }
    });

    // Preset Provider Listener
    DOM.apiProviderPreset.addEventListener('change', (e) => {
        const presets = {
            'local': 'http://localhost:11434/v1',
            'deepseek': 'https://api.deepseek.com/v1',
            'google': 'https://generativelanguage.googleapis.com/v1beta/openai',
            'openrouter': 'https://openrouter.ai/api/v1'
        };
        if (presets[e.target.value]) {
            DOM.apiUrl.value = presets[e.target.value];
        }
    });

    function toggleSystemPrompt() {
        if (DOM.systemPromptSelect.value === 'custom') {
            DOM.systemPromptContainer.style.display = 'block';
        } else {
            DOM.systemPromptContainer.style.display = 'none';
        }
    }
    
    DOM.systemPromptSelect.addEventListener('change', toggleSystemPrompt);

    // Initial load
    updateProfileSelect();
    loadProfile(currentProfileId);

    // UI Listeners
    DOM.settingsBtn.addEventListener('click', () => DOM.settingsDialog.classList.remove('hidden'));
    DOM.closeSettingsBtn.addEventListener('click', () => {
        saveCurrentProfile();
        DOM.settingsDialog.classList.add('hidden');
    });

    DOM.overlapSize.addEventListener('input', (e) => DOM.overlapValLabel.textContent = e.target.value);

    // Connect & Fetch Models API
    async function syncBackend() {
        const base = DOM.apiUrl.value.replace(/\/+$/, '');
        DOM.connectBtn.innerHTML = '<span class="md-spinner" style="width:20px;height:20px;border-width:2px;margin:0;"></span>';
        
        const headers = {};
        if (DOM.apiKey.value.trim()) {
            headers['Authorization'] = `Bearer ${DOM.apiKey.value.trim()}`;
        }
        
        try {
            const resModels = await fetch(`${base}/models`, { headers });
            const dataModels = await resModels.json();
            
            DOM.modelSelect.innerHTML = '';
            if (dataModels.data && dataModels.data.length > 0) {
                dataModels.data.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.id;
                    opt.textContent = m.id;
                    DOM.modelSelect.appendChild(opt);
                });
            } else {
                DOM.modelSelect.innerHTML = '<option value="local-model">local-model (Generico)</option>';
            }



            const prevModel = localStorage.getItem('selectedModel');
            if (prevModel && Array.from(DOM.modelSelect.options).some(o => o.value === prevModel)) {
                DOM.modelSelect.value = prevModel;
            }

            return true;
        } catch (err) {
            DOM.modelSelect.innerHTML = '<option value="local-model">local-model (Sin conexión)</option>';
            return false;
        } finally {
            DOM.connectBtn.innerHTML = '<span class="material-symbols-outlined">sync</span>';
        }
    }

    DOM.connectBtn.addEventListener('click', async () => {
        const success = await syncBackend();
        if (success) alert('Backend conectado y parámetros sincronizados correctamente.');
        else alert('No se pudo conectar a la API. Verifica la URL o si requiere CORS.');
    });

    // Auto-sync on load
    syncBackend();

    // File Parsing (Drag & Drop)
    DOM.dropZone.addEventListener('click', (e) => {
        if (e.target !== DOM.fileInput) DOM.fileInput.click();
    });
    DOM.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.dropZone.classList.add('dragover');
    });
    DOM.dropZone.addEventListener('dragleave', () => DOM.dropZone.classList.remove('dragover'));
    DOM.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            DOM.fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: DOM.fileInput });
        }
    });
    DOM.fileInput.addEventListener('change', handleFileSelect);

    async function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        DOM.sourceText.value = 'Procesando archivo...';
        try {
            const ext = file.name.split('.').pop().toLowerCase();
            let text = '';
            if (ext === 'txt') {
                text = await readFile(file);
            } else if (ext === 'pdf') {
                const arr = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arr }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ') + '\n';
                }
            } else if (ext === 'docx') {
                const arr = await file.arrayBuffer();
                const res = await mammoth.extractRawText({ arrayBuffer: arr });
                text = res.value;
            } else {
                text = await readFile(file);
                text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
            }
            DOM.sourceText.value = text;
            DOM.sourceText.style.height = 'auto';
            DOM.sourceText.style.height = DOM.sourceText.scrollHeight + 'px';
        } catch (err) {
            alert('Error al leer el archivo: ' + err.message);
            DOM.sourceText.value = '';
        }
    }
    
    function readFile(file) {
        return new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = e => res(e.target.result);
            r.onerror = rej;
            r.readAsText(file);
        });
    }

    DOM.clearBtn.addEventListener('click', () => {
        DOM.sourceText.value = '';
        DOM.targetText.value = '';
        DOM.sourceText.style.height = 'auto';
        DOM.targetText.style.height = 'auto';
    });

    DOM.sourceText.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
    DOM.copyBtn.addEventListener('click', () => navigator.clipboard.writeText(DOM.targetText.value));
    DOM.downloadBtn.addEventListener('click', () => {
        if(!DOM.targetText.value) return;
        const blob = new Blob([DOM.targetText.value], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'traduccion_material.txt';
        a.click();
    });

    DOM.cancelBtn.addEventListener('click', () => { cancelTranslation = true; });

    // Chunking Logic
    function chunkText(text, maxInputChars) {
        const blocks = text.split(/\n\n+/);
        const chunks = [];
        let cur = '';

        for (const b of blocks) {
            if (!b.trim()) continue;
            if ((cur.length + b.length) < maxInputChars) {
                cur += (cur ? '\n\n' : '') + b;
            } else {
                if (cur) chunks.push({ text: cur, separator: chunks.length > 0 ? '\n\n' : '' });
                if (b.length > maxInputChars) {
                    let rem = b;
                    let nextSeparator = chunks.length > 0 ? '\n\n' : '';
                    
                    while (rem.length > 0) {
                        if (rem.length <= maxInputChars) {
                            chunks.push({ text: rem, separator: nextSeparator });
                            break;
                        }
                        let maxIdx = maxInputChars;
                        // Ventana del 20% del presupuesto final
                        let windowStart = Math.max(0, Math.floor(maxInputChars * 0.8)); 
                        let searchArea = rem.substring(windowStart, maxIdx);
                        
                        // Buscar puntuación (. ? ! ; : ,) seguida de espacio
                        let regex = /[.?!;:,](?=\s)/g;
                        let matches = [...searchArea.matchAll(regex)];
                        
                        let breakIdx = -1;
                        let isComma = false;
                        if (matches.length > 0) {
                            // Cortar justo después del signo de puntuación
                            let lastMatch = matches[matches.length - 1];
                            breakIdx = windowStart + lastMatch.index + 1;
                            if (lastMatch[0] === ',') isComma = true;
                        } else {
                            // Fallback: buscar el último espacio normal
                            breakIdx = rem.lastIndexOf(' ', maxIdx);
                        }

                        if (breakIdx === -1) {
                            // Hard cut si es una palabra gigantesca
                            chunks.push({ text: rem.substring(0, maxInputChars), separator: nextSeparator });
                            rem = rem.substring(maxInputChars).trimStart();
                            nextSeparator = ' ';
                        } else {
                            chunks.push({ text: rem.substring(0, breakIdx), separator: nextSeparator });
                            // Avanzar desde el corte sin repetir la última palabra
                            rem = rem.substring(breakIdx).trimStart();
                            // Usar un espacio como separador para la siguiente mitad del bloque, evitando saltos de línea
                            nextSeparator = ' ';
                        }
                    }
                    cur = '';
                } else {
                    cur = b;
                }
            }
        }
        if (cur) chunks.push({ text: cur, separator: chunks.length > 0 ? '\n\n' : '' });
        return chunks;
    }

    // Translation Logic
    DOM.translateBtn.addEventListener('click', async () => {
        const text = DOM.sourceText.value.trim();
        if (!text) return;

        const base = DOM.apiUrl.value.replace(/\/+$/, '');
        const model = DOM.modelSelect.value || 'local-model';
        const mode = DOM.instructionMode.value;
        const overlapPct = parseInt(DOM.overlapSize.value);
        const hideThink = true;

        // Limita el contexto de entrada al valor configurado
        const maxInputChars = parseInt(DOM.maxInputChars.value) || 2048;
        
        // Limita la salida al valor configurado
        const maxOutTokens = parseInt(DOM.maxOutTokens.value) || 1024;

        const chunks = chunkText(text, maxInputChars);

        cancelTranslation = false;
        DOM.targetText.value = '';
        DOM.loadingOverlay.classList.remove('hidden');
        DOM.progressContainer.classList.remove('hidden');
        DOM.cancelBtn.classList.remove('hidden');

        let finalFullTranslation = '';

        for (let i = 0; i < chunks.length; i++) {
            if (cancelTranslation) break;
            
            DOM.loadingStatus.textContent = `Traduciendo fragmento ${i + 1} de ${chunks.length}...`;
            DOM.progressBar.style.width = `${((i) / chunks.length) * 100}%`;

            let currentInput = chunks[i].text;
            
            // Add overlap context if N > 0
            if (i > 0 && overlapPct > 0) {
                // Calculate overlap chars = maxInputChars * (overlapPct / 100)
                const overlapCharsLimit = Math.floor(maxInputChars * (overlapPct / 100));
                let overlapContext = finalFullTranslation.substring(finalFullTranslation.length - overlapCharsLimit);
                
                // Evitar iniciar el contexto con una palabra cortada
                const firstSpaceIdx = overlapContext.indexOf(' ');
                if (firstSpaceIdx !== -1 && firstSpaceIdx < overlapContext.length) {
                    overlapContext = overlapContext.substring(firstSpaceIdx).trimStart();
                }

                currentInput = `[CONTEXTO PREVIO PARA COHERENCIA]:\n...${overlapContext}\n\n[TRADUCIR EL SIGUIENTE TEXTO]:\n${currentInput}`;
            }

            const lang = DOM.targetLang.value.trim() || 'español';
            
            const presetPrompts = {
                'translation': 'Translate the following text into {lang}. Provide only the translation, without any additional explanations, notes, or conversational text.',
                'localization': 'Localize the following text into {lang}. Adapt the text so it sounds natural, fluent, and culturally appropriate for native speakers. Provide only the localized text, without any additional explanations, notes, or conversational text.'
            };
            
            let sysPromptTemplate;
            if (DOM.systemPromptSelect.value === 'custom') {
                sysPromptTemplate = DOM.systemPrompt.value.trim() || presetPrompts['translation'];
            } else {
                sysPromptTemplate = presetPrompts[DOM.systemPromptSelect.value] || presetPrompts['translation'];
            }
            
            const sysPrompt = sysPromptTemplate.replace(/\{lang\}/g, lang);
            
            let reqBody, endpoint;
            
            if (mode === 'chat') {
                endpoint = `${base}/chat/completions`;
                reqBody = {
                    model: model,
                    messages: [
                        { role: 'system', content: sysPrompt },
                        { role: 'user', content: currentInput }
                    ],
                    stream: true,
                    temperature: 0.3,
                    max_tokens: maxOutTokens,
                    reasoning_effort: "low"
                };
            } else {
                // Raw Completions for Kobold Lite Presets
                endpoint = `${base}/completions`;
                let rawPrompt = '';
                switch(mode) {
                    case 'chatml': rawPrompt = `<|im_start|>system\n${sysPrompt}<|im_end|>\n<|im_start|>user\n${currentInput}<|im_end|>\n<|im_start|>assistant\n`; break;
                    case 'llama3': rawPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${sysPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${currentInput}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`; break;
                    case 'alpaca': rawPrompt = `${sysPrompt}\n\n### Instruction:\n${currentInput}\n\n### Response:\n`; break;
                    case 'vicuna': rawPrompt = `SYSTEM: ${sysPrompt}\nUSER: ${currentInput}\nASSISTANT: `; break;
                    case 'gemma': rawPrompt = `<start_of_turn>user\n${sysPrompt}\n\n${currentInput}<end_of_turn>\n<start_of_turn>model\n`; break;
                }
                reqBody = {
                    model: model,
                    prompt: rawPrompt,
                    stream: true,
                    temperature: 0.3,
                    max_tokens: maxOutTokens,
                    reasoning_effort: "low"
                };
            }

            try {
                const headers = { 'Content-Type': 'application/json' };
                if (DOM.apiKey.value.trim()) {
                    headers['Authorization'] = `Bearer ${DOM.apiKey.value.trim()}`;
                }

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(reqBody)
                });

                if (!res.ok) throw new Error(await res.text());

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let chunkTranslationRaw = '';

                while (true) {
                    if (cancelTranslation) {
                        reader.cancel();
                        break;
                    }
                    const { done, value } = await reader.read();
                    if (done) break;

                    const textChunk = decoder.decode(value, { stream: true });
                    const lines = textChunk.split('\n');

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                            try {
                                const data = JSON.parse(trimmed.substring(6));
                                let content = '';
                                if (data.choices && data.choices[0]) {
                                    if (data.choices[0].delta && data.choices[0].delta.content) content = data.choices[0].delta.content; // chat
                                    if (data.choices[0].text) content = data.choices[0].text; // completions
                                }
                                
                                if (content) {
                                    chunkTranslationRaw += content;
                                    
                                    // Reasoning filter logic
                                    let displayChunk = chunkTranslationRaw;
                                    if (hideThink) {
                                        displayChunk = displayChunk.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '');
                                    }
                                    
                                    DOM.targetText.value = finalFullTranslation + chunks[i].separator + displayChunk;
                                    DOM.targetText.style.height = 'auto';
                                    DOM.targetText.style.height = DOM.targetText.scrollHeight + 'px';
                                    // DOM.targetText.scrollTop = DOM.targetText.scrollHeight;
                                }
                            } catch (e) { /* ignore parse errors */ }
                        }
                    }
                }

                // Add this chunk's cleaned text to the final tracker
                let finalChunkProcessed = chunkTranslationRaw;
                if (hideThink) {
                    finalChunkProcessed = finalChunkProcessed.replace(/<think>[\s\S]*?<\/think>/gi, '');
                    // if tag was never closed, clean it up anyway
                    finalChunkProcessed = finalChunkProcessed.replace(/<think>[\s\S]*/gi, '');
                }

                finalFullTranslation += chunks[i].separator + finalChunkProcessed.trim();

            } catch (err) {
                if (!cancelTranslation) alert(`Error en fragmento ${i+1}: ${err.message}`);
                break; // Stop chunking loop on error
            }
        }

        DOM.loadingOverlay.classList.add('hidden');
        DOM.progressContainer.classList.add('hidden');
        DOM.cancelBtn.classList.add('hidden');
        if (!cancelTranslation) {
            DOM.progressBar.style.width = `100%`;
            DOM.targetText.value = finalFullTranslation; // Clean final state
        }
    });
});
