class TemporalOrchestrator {
  constructor() {
    this.activeVoyage = 'timepiece';
    this.chroniclerActive = false;
    this.countdownActive = false;
    this.elapsedTicks = 0;
    this.remainingTicks = 0;
    this.rafHandle = null;
    this.lastFrameStamp = 0;
    this.realmEngaged = false;
    this.cursorFadeTimer = null;
    
    this.initializeLuminance();
    this.bindVoyageTransitions();
    this.seedOrbitalMarkers();
    this.composeActionInterface();
    this.bindRealmController();
    this.resurrectPreferences();
    
    this.orchestrateTimepieceLoop();
  }

  initializeLuminance() {
    const storedAura = localStorage.getItem('aura_preference_v2') || 'diurnal';
    document.documentElement.setAttribute('data-luminance', storedAura);
    
    const shifterBtn = document.getElementById('luminanceBtn');
    shifterBtn.addEventListener('click', () => {
      const currentAura = document.documentElement.getAttribute('data-luminance');
      const nextAura = currentAura === 'diurnal' ? 'nocturnal' : 'diurnal';
      document.documentElement.setAttribute('data-luminance', nextAura);
      localStorage.setItem('aura_preference_v2', nextAura);
    });
  }

  bindVoyageTransitions() {
    const voyageTabs = document.querySelectorAll('.voyage-tab');
    voyageTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.dataset.voyage === this.activeVoyage) return;
        
        const stage = document.getElementById('horizonStage');
        stage.classList.add('morphing');
        
        const morphDuration = 500;
        setTimeout(() => {
          voyageTabs.forEach(t => t.classList.remove('voyage-tab--chosen'));
          tab.classList.add('voyage-tab--chosen');
          
          this.activeVoyage = tab.dataset.voyage;
          this.haltChronicler();
          this.haltCountdown();
          this.elapsedTicks = 0;
          this.remainingTicks = 0;
          this.refreshQuantumDisplay();
          this.composeActionInterface();
          
          setTimeout(() => {
            stage.classList.remove('morphing');
          }, 350);
        }, morphDuration);
      });
    });
  }

  seedOrbitalMarkers() {
    const markersContainer = document.getElementById('orbitalMarkers');
    const clockFaces = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    
    clockFaces.forEach((numeral, idx) => {
      const marker = document.createElement('div');
      marker.className = 'orbital-marker';
      const rotationDegree = (idx + 1) * 30;
      marker.style.transform = `rotate(${rotationDegree}deg)`;
      marker.innerHTML = `<span style="display:inline-block; transform:rotate(${-rotationDegree}deg); margin-top:10px;">${numeral}</span>`;
      markersContainer.appendChild(marker);
    });
  }

  generateFluxStructure() {
    const segments = [];
    
    segments.push(this.craftFluxPair(3, 'hora'));
    segments.push('<span class="chrono-separator">:</span>');
    segments.push(this.craftFluxPair(6, 'momento'));
    segments.push('<span class="chrono-separator">:</span>');
    segments.push(this.craftFluxPair(6, 'pulso'));
    
    return segments.join('');
  }

  craftFluxPair(cascadeLimit, identifier) {
    const majorGlyph = `<div class="flux-glyph">
      <div class="flux-cascade ${identifier}-major">
        ${this.buildCascadeSpans(cascadeLimit)}
      </div>
    </div>`;
    
    const minorGlyph = `<div class="flux-glyph">
      <div class="flux-cascade ${identifier}-minor">
        ${this.buildCascadeSpans(10)}
      </div>
    </div>`;
    
    return majorGlyph + minorGlyph;
  }

  buildCascadeSpans(limit) {
    let markup = '';
    for (let i = 0; i < limit; i++) {
      markup += `<span>${i}</span>`;
    }
    return markup;
  }

  shiftFluxCascade(cascadeType, numericalValue) {
    const majorDigit = Math.floor(numericalValue / 10);
    const minorDigit = numericalValue % 10;
    
    const majorCascade = document.querySelector(`.${cascadeType}-major`);
    const minorCascade = document.querySelector(`.${cascadeType}-minor`);
    
    if (majorCascade && minorCascade) {
      const spanHeight = majorCascade.querySelector('span').offsetHeight;
      majorCascade.style.transform = `translateY(-${majorDigit * spanHeight}px)`;
      minorCascade.style.transform = `translateY(-${minorDigit * spanHeight}px)`;
    }
  }

  orchestrateTimepieceLoop() {
    setInterval(() => {
      if (this.activeVoyage === 'timepiece' && !this.realmEngaged) {
        this.refreshTimepieceDisplay();
      }
      if (this.realmEngaged) {
        this.refreshFloatingTimepiece();
      }
    }, 1000);
  }

  refreshTimepieceDisplay() {
    const temporalStamp = new Date();
    const horaValue = temporalStamp.getHours();
    const momentoValue = temporalStamp.getMinutes();
    const pulsoValue = temporalStamp.getSeconds();

    const quantumDisplay = document.getElementById('quantumDisplay');
    const orbitalCanvas = document.getElementById('orbitalCanvas');
    
    if (!quantumDisplay.querySelector('.flux-glyph')) {
      quantumDisplay.innerHTML = this.generateFluxStructure();
    }

    requestAnimationFrame(() => {
      this.shiftFluxCascade('hora', horaValue);
      this.shiftFluxCascade('momento', momentoValue);
      this.shiftFluxCascade('pulso', pulsoValue);
    });

    const totalHoraSeconds = (horaValue % 12) * 3600 + momentoValue * 60 + pulsoValue;
    const majorArmDegree = (totalHoraSeconds / 43200) * 360;
    const totalMomentoSeconds = momentoValue * 60 + pulsoValue;
    const medialArmDegree = (totalMomentoSeconds / 3600) * 360;
    const swiftArmDegree = (pulsoValue / 60) * 360;

    if (orbitalCanvas) {
      orbitalCanvas.style.display = 'block';
      requestAnimationFrame(() => {
        document.querySelector('.orbital-arm--major').style.transform = `rotate(${majorArmDegree}deg)`;
        document.querySelector('.orbital-arm--medial').style.transform = `rotate(${medialArmDegree}deg)`;
        document.querySelector('.orbital-arm--swift').style.transform = `rotate(${swiftArmDegree}deg)`;
      });
    }
  }

  refreshOrbitalArms() {
    const ticks = this.activeVoyage === 'chronicler' ? this.elapsedTicks : this.remainingTicks;
    const totalSeconds = Math.floor(ticks / 1000);
    const horaSegment = Math.floor(totalSeconds / 3600);
    const momentoSegment = Math.floor((totalSeconds % 3600) / 60);
    const pulsoSegment = totalSeconds % 60;
    
    const majorDegree = ((horaSegment % 12) / 12) * 360 + (momentoSegment / 60) * 30;
    const medialDegree = (momentoSegment / 60) * 360 + (pulsoSegment / 60) * 6;
    const swiftDegree = (pulsoSegment / 60) * 360;

    requestAnimationFrame(() => {
      document.querySelector('.orbital-arm--major').style.transform = `rotate(${majorDegree}deg)`;
      document.querySelector('.orbital-arm--medial').style.transform = `rotate(${medialDegree}deg)`;
      document.querySelector('.orbital-arm--swift').style.transform = `rotate(${swiftDegree}deg)`;
    });
  }

  initiateChronicler() {
    if (this.chroniclerActive) return;
    this.chroniclerActive = true;

    this.lastFrameStamp = performance.now();
    const recurse = (timestamp) => {
      if (!this.chroniclerActive) return;
      
      const deltaMs = timestamp - this.lastFrameStamp;
      this.lastFrameStamp = timestamp;
      this.elapsedTicks += deltaMs;
      
      this.refreshQuantumDisplay();
      this.refreshOrbitalArms();
      this.rafHandle = requestAnimationFrame(recurse);
    };
    this.rafHandle = requestAnimationFrame(recurse);
  }

  haltChronicler() {
    this.chroniclerActive = false;
    if (this.rafHandle) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  initiateCountdown() {
    if (this.remainingTicks <= 0) return;
    if (this.countdownActive) return;
    this.countdownActive = true;

    this.lastFrameStamp = performance.now();
    const recurse = (timestamp) => {
      if (!this.countdownActive) return;
      
      const deltaMs = timestamp - this.lastFrameStamp;
      this.lastFrameStamp = timestamp;
      this.remainingTicks = Math.max(0, this.remainingTicks - deltaMs);
      
      if (this.remainingTicks <= 0) {
        this.haltCountdown();
        this.triggerCountdownAlert();
      }
      
      this.refreshQuantumDisplay();
      this.refreshOrbitalArms();
      this.rafHandle = requestAnimationFrame(recurse);
    };
    this.rafHandle = requestAnimationFrame(recurse);
  }

  haltCountdown() {
    this.countdownActive = false;
    if (this.rafHandle) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  triggerCountdownAlert() {
    const alertMsg = '⏰ Countdown Complete!';
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alertMsg);
    } else {
      alert(alertMsg);
    }
  }

  resetChronicler() {
    this.haltChronicler();
    this.elapsedTicks = 0;
    this.refreshQuantumDisplay();
    this.refreshOrbitalArms();
  }

  resetCountdown() {
    this.haltCountdown();
    this.remainingTicks = 0;
    this.refreshQuantumDisplay();
    this.refreshOrbitalArms();
  }

  refreshQuantumDisplay() {
    const quantumDisplay = document.getElementById('quantumDisplay');
    
    if (this.activeVoyage === 'timepiece') {
      this.refreshTimepieceDisplay();
    } else {
      const tickValue = this.activeVoyage === 'chronicler' ? this.elapsedTicks : this.remainingTicks;
      
      if (tickValue === 0 && !this.chroniclerActive && !this.countdownActive) {
        this.renderNullState();
      } else {
        const fractionMs = String(Math.floor((tickValue % 1000) / 10)).padStart(2, '0');
        const pulsos = String(Math.floor((tickValue / 1000) % 60)).padStart(2, '0');
        const momentos = String(Math.floor((tickValue / 60000) % 60)).padStart(2, '0');
        const horas = String(Math.floor(tickValue / 3600000)).padStart(2, '0');

        const fractionMarkup = this.activeVoyage === 'chronicler' 
          ? `<span class="fraction-display">.${fractionMs}</span>` 
          : '';

        quantumDisplay.innerHTML = `
          <span>${horas}</span>
          <span class="chrono-separator">:</span>
          <span>${momentos}</span>
          <span class="chrono-separator">:</span>
          <span>${pulsos}</span>
          ${fractionMarkup}
        `;
        
        this.refreshOrbitalArms();
      }
    }
  }

  renderNullState() {
    const quantumDisplay = document.getElementById('quantumDisplay');
    const fractionMarkup = this.activeVoyage === 'chronicler' 
      ? '<span class="fraction-display">.00</span>' 
      : '';

    quantumDisplay.innerHTML = `
      <span>00</span>
      <span class="chrono-separator">:</span>
      <span>00</span>
      <span class="chrono-separator">:</span>
      <span>00</span>
      ${fractionMarkup}
    `;
    
    requestAnimationFrame(() => {
      document.querySelector('.orbital-arm--major').style.transform = 'rotate(0deg)';
      document.querySelector('.orbital-arm--medial').style.transform = 'rotate(0deg)';
      document.querySelector('.orbital-arm--swift').style.transform = 'rotate(0deg)';
    });
  }

  composeActionInterface() {
    const actionBay = document.getElementById('actionBay');
    actionBay.innerHTML = '';

    if (this.activeVoyage === 'chronicler') {
      const startBtn = document.createElement('button');
      startBtn.textContent = 'Initiate';
      startBtn.onclick = () => this.initiateChronicler();
      
      const haltBtn = document.createElement('button');
      haltBtn.textContent = 'Suspend';
      haltBtn.onclick = () => this.haltChronicler();
      
      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Nullify';
      resetBtn.onclick = () => this.resetChronicler();
      
      actionBay.appendChild(startBtn);
      actionBay.appendChild(haltBtn);
      actionBay.appendChild(resetBtn);
    } else if (this.activeVoyage === 'countdown') {
      const configurator = document.createElement('div');
      configurator.className = 'interval-configurator';
      
      const segments = [
        { label: 'Horas', id: 'horaInput', max: 99 },
        { label: 'Momentos', id: 'momentoInput', max: 59 },
        { label: 'Pulsos', id: 'pulsoInput', max: 59 }
      ];
      
      segments.forEach(seg => {
        const segment = document.createElement('div');
        segment.className = 'interval-segment';
        
        const label = document.createElement('label');
        label.textContent = seg.label;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'interval-input';
        input.id = seg.id;
        input.min = '0';
        input.max = String(seg.max);
        input.placeholder = '00';
        input.addEventListener('input', () => this.recalculateCountdown());
        
        segment.appendChild(label);
        segment.appendChild(input);
        configurator.appendChild(segment);
      });
      
      const startBtn = document.createElement('button');
      startBtn.textContent = 'Commence';
      startBtn.onclick = () => this.initiateCountdown();
      
      const haltBtn = document.createElement('button');
      haltBtn.textContent = 'Suspend';
      haltBtn.onclick = () => this.haltCountdown();
      
      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Nullify';
      resetBtn.onclick = () => this.resetCountdown();
      
      actionBay.appendChild(configurator);
      actionBay.appendChild(startBtn);
      actionBay.appendChild(haltBtn);
      actionBay.appendChild(resetBtn);
    }
  }

  recalculateCountdown() {
    const horaInput = document.getElementById('horaInput');
    const momentoInput = document.getElementById('momentoInput');
    const pulsoInput = document.getElementById('pulsoInput');
    
    const horas = parseInt(horaInput?.value) || 0;
    const momentos = parseInt(momentoInput?.value) || 0;
    const pulsos = parseInt(pulsoInput?.value) || 0;
    
    this.remainingTicks = (horas * 3600 + momentos * 60 + pulsos) * 1000;
    this.refreshQuantumDisplay();
  }

  bindRealmController() {
    const realmBtn = document.getElementById('realmBtn');
    const realmOverlay = document.getElementById('realmOverlay');
    
    realmBtn.addEventListener('click', () => this.engageRealm());
    
    const exitTriggers = ['click', 'keydown', 'mousemove', 'touchstart'];
    exitTriggers.forEach(eventType => {
      realmOverlay.addEventListener(eventType, (e) => {
        if (this.realmEngaged) {
          this.disengageRealm();
        }
      }, { once: false });
    });
    
    realmOverlay.addEventListener('mousemove', () => {
      if (this.realmEngaged) {
        this.scheduleCursorFade();
      }
    });
  }

  engageRealm() {
    this.realmEngaged = true;
    const realmOverlay = document.getElementById('realmOverlay');
    realmOverlay.classList.add('realm-active');
    
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    
    localStorage.setItem('realm_preference_v2', 'engaged');
    this.refreshFloatingTimepiece();
    this.scheduleCursorFade();
  }

  disengageRealm() {
    this.realmEngaged = false;
    const realmOverlay = document.getElementById('realmOverlay');
    realmOverlay.classList.remove('realm-active');
    document.body.classList.remove('pointer-hidden');
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    
    if (this.cursorFadeTimer) {
      clearTimeout(this.cursorFadeTimer);
      this.cursorFadeTimer = null;
    }
    
    localStorage.setItem('realm_preference_v2', 'disengaged');
  }

  scheduleCursorFade() {
    document.body.classList.remove('pointer-hidden');
    
    if (this.cursorFadeTimer) {
      clearTimeout(this.cursorFadeTimer);
    }
    
    this.cursorFadeTimer = setTimeout(() => {
      document.body.classList.add('pointer-hidden');
    }, 3000);
  }

  refreshFloatingTimepiece() {
    const floatingTimepiece = document.getElementById('floatingTimepiece');
    const now = new Date();
    const horas = String(now.getHours()).padStart(2, '0');
    const momentos = String(now.getMinutes()).padStart(2, '0');
    const pulsos = String(now.getSeconds()).padStart(2, '0');
    
    floatingTimepiece.textContent = `${horas}:${momentos}:${pulsos}`;
  }

  resurrectPreferences() {
    const realmPref = localStorage.getItem('realm_preference_v2');
    if (realmPref === 'engaged') {
    }
  }
}

const orchestrator = new TemporalOrchestrator();
