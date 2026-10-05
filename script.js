// Constants
const STORAGE_KEY = 'laco_amigo_user_session';
const SPLASH_DISPLAY_TIME_MS = 2500; // Tempo em milissegundos para exibir a tela de carregamento

// DOM Element Cache
const splashScreen = document.getElementById('splashScreen');
const tabRegister = document.getElementById('tabRegister');
const tabLogin = document.getElementById('tabLogin');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

const alertBox = document.getElementById('alertBox');
const alertIcon = document.getElementById('alertIcon');
const alertMessage = document.getElementById('alertMessage');

const savedSessionCard = document.getElementById('savedSessionCard');
const savedUserEmail = document.getElementById('savedUserEmail');
const btnClearSaved = document.getElementById('btnClearSaved');

const regName = document.getElementById('regName');
const regEmail = document.getElementById('regEmail');
const regPhone = document.getElementById('regPhone');
const regCPF = document.getElementById('regCPF');
const regState = document.getElementById('regState');
const regCity = document.getElementById('regCity');
const regNeighborhood = document.getElementById('regNeighborhood');
const regStreet = document.getElementById('regStreet');
const regNumber = document.getElementById('regNumber');
const regComplement = document.getElementById('regComplement');
const regPassword = document.getElementById('regPassword');
const regConfirmPassword = document.getElementById('regConfirmPassword');
const regSaveCredentials = document.getElementById('regSaveCredentials');
const termsCheck = document.getElementById('termsCheck');

const passCharCount = document.getElementById('passCharCount');
const passStrengthLabel = document.getElementById('passStrengthLabel');
const passStrengthBar = document.getElementById('passStrengthBar');

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const rememberMe = document.getElementById('rememberMe');

const btnToggleRegPassword = document.getElementById('btnToggleRegPassword');
const toggleRegIcon = document.getElementById('toggleRegIcon');
const btnToggleConfirmPassword = document.getElementById('btnToggleConfirmPassword');
const toggleConfirmIcon = document.getElementById('toggleConfirmIcon');
const btnToggleLoginPassword = document.getElementById('btnToggleLoginPassword');
const toggleLoginIcon = document.getElementById('toggleLoginIcon');

const btnGoToLogin = document.getElementById('btnGoToLogin');
const btnGoToRegister = document.getElementById('btnGoToRegister');
const btnForgotPassword = document.getElementById('btnForgotPassword');

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const btnCloseModalX = document.getElementById('btnCloseModalX');
const btnCloseModalBtn = document.getElementById('btnCloseModalBtn');
const btnModalTerms = document.getElementById('btnModalTerms');
const btnModalPrivacy = document.getElementById('btnModalPrivacy');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    checkSavedSession();
    setupEventListeners();
});

// Splash Screen Timer & Transition
function initSplashScreen() {
    if (!splashScreen) return;

    // Desativa o scroll durante o carregamento
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        splashScreen.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';

        // Remove do DOM após finalizar transição CSS
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 700);
    }, SPLASH_DISPLAY_TIME_MS);
}

// Event Listeners Setup
function setupEventListeners() {
    tabRegister.addEventListener('click', showRegisterTab);
    tabLogin.addEventListener('click', showLoginTab);
    btnGoToLogin.addEventListener('click', showLoginTab);
    btnGoToRegister.addEventListener('click', showRegisterTab);

    // Password visibility toggles
    btnToggleRegPassword.addEventListener('click', () => togglePasswordVisibility(regPassword, toggleRegIcon));
    btnToggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility(regConfirmPassword, toggleConfirmIcon));
    btnToggleLoginPassword.addEventListener('click', () => togglePasswordVisibility(loginPassword, toggleLoginIcon));

    // Input Masks & Validation Controls
    regPhone.addEventListener('input', handlePhoneMask);
    regCPF.addEventListener('input', handleCPFMask);
    regPassword.addEventListener('input', handlePasswordStrength);

    // Form Submissions
    registerForm.addEventListener('submit', handleRegisterSubmit);
    loginForm.addEventListener('submit', handleLoginSubmit);

    // Clear session
    btnClearSaved.addEventListener('click', clearSavedSession);

    // Modal Events
    btnModalTerms.addEventListener('click', () => openModal('Termos de Uso', 'Ao utilizar a plataforma Laço Amigo, concorda em manter um ambiente respeitoso, seguro e acessível. Todas as informações inseridas são mantidas sob estrito sigilo e utilizadas exclusivamente para aproximar cuidadores, idosos e familiares.'));
    btnModalPrivacy.addEventListener('click', () => openModal('Política de Privacidade', 'Sua privacidade é nossa prioridade. Todos os dados pessoais (nome, endereço, telefone, CPF) fornecidos no cadastro são armazenados localmente ou em ambiente seguro criptografado, respeitando as diretrizes gerais de proteção de dados.'));
    btnCloseModalX.addEventListener('click', closeModal);
    btnCloseModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

    btnForgotPassword.addEventListener('click', () => {
        showAlert('Instruções para redefinir a sua palavra-passe foram enviadas para o e-mail cadastrado (Simulação).', 'info');
    });
}

// Navigation Tabs Logic
function showRegisterTab() {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    hideAlert();
}

function showLoginTab() {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    hideAlert();
}

// Password Visibility Helper
function togglePasswordVisibility(inputField, iconElement) {
    if (inputField.type === 'password') {
        inputField.type = 'text';
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        inputField.type = 'password';
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}

// Input Masking Helpers
function handlePhoneMask(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    
    if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2})$/, '($1');
    }
    e.target.value = v;
}

function handleCPFMask(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    
    if (v.length > 9) {
        v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
        v = v.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
    } else if (v.length > 3) {
        v = v.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
    }
    e.target.value = v;
}

// Password Strength Bar Helper
function handlePasswordStrength(e) {
    const val = e.target.value;
    const len = val.length;

    passCharCount.textContent = `Mínimo 8 dígitos (${len}/8)`;

    if (len < 8) {
        passCharCount.className = 'text-slate-500 font-semibold';
    } else {
        passCharCount.className = 'text-emerald-600 font-bold';
    }

    let score = 0;
    if (len >= 8) score += 40;
    if (/[A-Z]/.test(val)) score += 20;
    if (/[0-9]/.test(val)) score += 20;
    if (/[^A-Za-z0-9]/.test(val)) score += 20;

    if (len === 0) {
        passStrengthBar.style.width = '0%';
        passStrengthBar.className = 'h-full bg-slate-400 transition-all duration-300';
        passStrengthLabel.textContent = 'Insira a senha';
        passStrengthLabel.className = 'text-slate-400';
    } else if (len < 8) {
        passStrengthBar.style.width = `${Math.min((len / 8) * 30, 30)}%`;
        passStrengthBar.className = 'h-full bg-red-500 transition-all duration-300';
        passStrengthLabel.textContent = 'Muito curta';
        passStrengthLabel.className = 'text-red-500 font-bold';
    } else if (score < 60) {
        passStrengthBar.style.width = '50%';
        passStrengthBar.className = 'h-full bg-amber-500 transition-all duration-300';
        passStrengthLabel.textContent = 'Fraca';
        passStrengthLabel.className = 'text-amber-600 font-bold';
    } else if (score < 80) {
        passStrengthBar.style.width = '75%';
        passStrengthBar.className = 'h-full bg-blue-500 transition-all duration-300';
        passStrengthLabel.textContent = 'Média';
        passStrengthLabel.className = 'text-blue-600 font-bold';
    } else {
        passStrengthBar.style.width = '100%';
        passStrengthBar.className = 'h-full bg-emerald-500 transition-all duration-300';
        passStrengthLabel.textContent = 'Forte';
        passStrengthLabel.className = 'text-emerald-600 font-bold';
    }
}

// Registration Logic
function handleRegisterSubmit(e) {
    e.preventDefault();

    if (regPassword.value.length < 8) {
        showAlert('A senha deve conter no mínimo 8 dígitos.', 'error');
        regPassword.focus();
        return;
    }

    if (regPassword.value !== regConfirmPassword.value) {
        showAlert('As senhas não coincidem. Verifique e tente novamente.', 'error');
        regConfirmPassword.focus();
        return;
    }

    if (!termsCheck.checked) {
        showAlert('Você precisa aceitar os Termos de Uso e Política de Privacidade.', 'error');
        return;
    }

    const userData = {
        name: regName.value.trim(),
        email: regEmail.value.trim().toLowerCase(),
        phone: regPhone.value.trim(),
        cpf: regCPF.value.trim(),
        address: {
            state: regState.value,
            city: regCity.value.trim(),
            neighborhood: regNeighborhood.value.trim(),
            street: regStreet.value.trim(),
            number: regNumber.value.trim(),
            complement: regComplement.value.trim()
        },
        password: regPassword.value
    };

    if (regSaveCredentials.checked) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        updateSavedSessionCard(userData.email);
    }

    showAlert('Cadastro realizado com sucesso! Seja bem-vindo(a) ao Laço Amigo.', 'success');
    
    setTimeout(() => {
        loginEmail.value = userData.email;
        loginPassword.value = '';
        showLoginTab();
        showAlert('Cadastro efetuado! Digite sua senha para entrar.', 'info');
    }, 1500);
}

// Login Logic
function handleLoginSubmit(e) {
    e.preventDefault();

    const enteredEmail = loginEmail.value.trim().toLowerCase();
    const enteredPassword = loginPassword.value;

    const savedData = getSavedData();

    if (savedData && savedData.email === enteredEmail) {
        if (savedData.password === enteredPassword) {
            showAlert(`Login bem-sucedido! Bem-vindo(a) de volta, ${savedData.name}!`, 'success');
            if (rememberMe.checked) {
                updateSavedSessionCard(savedData.email);
            }
            return;
        } else {
            showAlert('Senha incorreta para esta conta. Tente novamente.', 'error');
            return;
        }
    }

    if (enteredPassword.length >= 8) {
        if (rememberMe.checked) {
            const demoUser = { email: enteredEmail, name: enteredEmail.split('@')[0], password: enteredPassword };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
            updateSavedSessionCard(enteredEmail);
        }
        showAlert(`Acesso realizado com sucesso! Bem-vindo(a), ${enteredEmail}.`, 'success');
    } else {
        showAlert('Sua senha deve ter pelo menos 8 dígitos.', 'error');
    }
}

// Storage Helpers
function getSavedData() {
    try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
}

function checkSavedSession() {
    const saved = getSavedData();
    if (saved && saved.email) {
        updateSavedSessionCard(saved.email);
        loginEmail.value = saved.email;
    } else {
        savedSessionCard.classList.add('hidden');
    }
}

function updateSavedSessionCard(email) {
    savedUserEmail.textContent = email;
    savedSessionCard.classList.remove('hidden');
}

function clearSavedSession() {
    localStorage.removeItem(STORAGE_KEY);
    savedSessionCard.classList.add('hidden');
    loginEmail.value = '';
    loginPassword.value = '';
    showAlert('Dados salvos limpos deste dispositivo com sucesso.', 'info');
}

// Alert Notification System
function showAlert(msg, type = 'info') {
    alertMessage.textContent = msg;
    alertBox.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'border-red-300', 'bg-emerald-100', 'text-emerald-800', 'border-emerald-300', 'bg-teal-100', 'text-teal-800', 'border-teal-300');
    alertIcon.className = '';

    if (type === 'error') {
        alertBox.classList.add('bg-red-100', 'text-red-800', 'border', 'border-red-300');
        alertIcon.className = 'fa-solid fa-circle-exclamation text-red-600';
    } else if (type === 'success') {
        alertBox.classList.add('bg-emerald-100', 'text-emerald-800', 'border', 'border-emerald-300');
        alertIcon.className = 'fa-solid fa-circle-check text-emerald-600';
    } else {
        alertBox.classList.add('bg-teal-100', 'text-teal-800', 'border', 'border-teal-300');
        alertIcon.className = 'fa-solid fa-circle-info text-brandTeal';
    }

    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAlert() {
    alertBox.classList.add('hidden');
}

// Modal Helpers
function openModal(title, bodyText) {
    modalTitle.textContent = title;
    modalBody.textContent = bodyText;
    modalOverlay.classList.remove('hidden');
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}