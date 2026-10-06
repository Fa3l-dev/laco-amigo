const STORAGE_KEY = 'laco_amigo_user_session';
const USERS_DB_KEY = 'laco_amigo_registered_users';

document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    setupForms();
});

// Remove a Splash Screen após o carregamento
function initSplash() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => splash.remove(), 700);
        }, 2000);
    }
}

// Alternar visibilidade das senhas
function togglePasswordVisibility(id) {
    const field = document.getElementById(id);
    if (!field) return;
    field.type = field.type === 'password' ? 'text' : 'password';
}

// Alternar telas
function showCadastro() {
    document.getElementById('formLogin').classList.add('hidden');
    document.getElementById('formCadastro').classList.remove('hidden');
    document.getElementById('screenTitle').textContent = 'Criar sua Conta';
}

function showLogin() {
    document.getElementById('formCadastro').classList.add('hidden');
    document.getElementById('stepPerfil').classList.add('hidden');
    document.getElementById('screenTitle').classList.remove('hidden');
    document.getElementById('formLogin').classList.remove('hidden');
    document.getElementById('screenTitle').textContent = 'Entrar no App';
}

function backToCadastro() {
    document.getElementById('stepPerfil').classList.add('hidden');
    document.getElementById('screenTitle').classList.remove('hidden');
    document.getElementById('formCadastro').classList.remove('hidden');
}

// Objeto temporário para guardar os dados do registo durante as etapas
let tempUserData = {};

function setupForms() {
    // 1. AÇÃO DE LOGIN
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const senha = document.getElementById('loginSenha').value;

            // Busca os utilizadores gravados no navegador
            const registeredUsers = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (user) {
                if (user.senha === senha) {
                    // Guarda a sessão ativa
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
                    redirectToRolePage(user.perfil);
                } else {
                    alert('Senha incorreta! Verifique os dados digitados.');
                }
            } else {
                // Se não houver utilizador registado prévio, cria um genérico para testes rápidos
                const defaultUser = {
                    name: email.split('@')[0],
                    email: email,
                    perfil: 'Idoso'
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
                redirectToRolePage('Idoso');
            }
        });
    }

    // 2. AÇÃO DE CADASTRO (Passo 1 -> Avança para escolha do Perfil)
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            const senha = document.getElementById('senha').value;
            const confirmar = document.getElementById('confirmarSenha').value;

            if (senha !== confirmar) {
                alert('As senhas não coincidem!');
                return;
            }

            // Armazena dados temporariamente
            tempUserData = {
                name: document.getElementById('nome').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefone: document.getElementById('telefone').value,
                cpf: document.getElementById('cpf').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
                senha: senha
            };

            // Avança para o Passo 2
            document.getElementById('formCadastro').classList.add('hidden');
            document.getElementById('screenTitle').classList.add('hidden');
            document.getElementById('stepPerfil').classList.remove('hidden');
        });
    }
}

// 3. SELEÇÃO DE PERFIL E FINALIZAÇÃO DO REGISTO
function selectPerfil(perfil) {
    tempUserData.perfil = perfil;

    // Guarda no banco de utilizadores local
    const registeredUsers = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    registeredUsers.push(tempUserData);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(registeredUsers));

    alert(`Cadastro realizado com sucesso como "${perfil}"! Você será redirecionado para a tela de login.`);

    // Retorna para a tela de login preenchendo o e-mail cadastrado
    showLogin();
    document.getElementById('loginEmail').value = tempUserData.email;
    document.getElementById('loginSenha').value = '';
}

// 4. DIRECIONAMENTO PARA AS PÁGINAS SEGUNDO O PERFIL
function redirectToRolePage(perfil) {
    if (perfil === 'Ajudante' || perfil === 'Voluntário') {
        window.location.href = 'voluntario.html';
    } else {
        // Idoso e Responsável são direcionados para home.html
        window.location.href = 'home.html';
    }
}