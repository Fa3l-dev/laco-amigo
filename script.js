const STORAGE_KEY = 'laco_amigo_user_session';
const USERS_DB_KEY = 'laco_amigo_registered_users';
const ALERTS_KEY = 'laco_amigo_live_alerts';
const SERVICES_KEY = 'laco_amigo_live_services';

// Usuários padrão pré-cadastrados para testes
const PRESET_USERS = [
    {
        name: 'Maria da Silva',
        email: 'idoso@teste.com',
        senha: '12345678',
        perfil: 'Idoso',
        telefone: '(81) 98888-1111',
        cpf: '111.222.333-44',
        cidade: 'Paulista',
        estado: 'PE',
        bairro: 'Centro',
        rua: 'Rua das Flores',
        numero: '100'
    },
    {
        name: 'João da Silva',
        email: 'responsavel@teste.com',
        senha: '12345678',
        perfil: 'Responsável',
        telefone: '(81) 98888-2222',
        cpf: '555.666.777-88',
        cpfIdosoVinculado: '111.222.333-44',
        cidade: 'Paulista',
        estado: 'PE',
        bairro: 'Centro',
        rua: 'Rua das Flores',
        numero: '100'
    },
    {
        name: 'Carlos Silva',
        email: 'voluntario@teste.com',
        senha: '12345678',
        perfil: 'Voluntário',
        telefone: '(81) 98888-3333',
        cpf: '999.888.777-66',
        cidade: 'Paulista',
        estado: 'PE',
        bairro: 'Jardim Paulista',
        rua: 'Av. Brasil',
        numero: '50'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initPresetUsers();
    setupForms();
});

// Força a presença dos usuários de teste sem apagar cadastros manuais novos
function initPresetUsers() {
    let existingUsers = [];
    try {
        existingUsers = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    } catch (_) {
        existingUsers = [];
    }

    PRESET_USERS.forEach(preset => {
        const found = existingUsers.some(u => u.email && u.email.toLowerCase() === preset.email.toLowerCase());
        if (!found) {
            existingUsers.push(preset);
        }
    });

    localStorage.setItem(USERS_DB_KEY, JSON.stringify(existingUsers));
}

function togglePasswordVisibility(id) {
    const field = document.getElementById(id);
    if (!field) return;
    field.type = field.type === 'password' ? 'text' : 'password';
}

function showCadastro() {
    const formLogin = document.getElementById('formLogin');
    const formCadastro = document.getElementById('formCadastro');
    const screenTitle = document.getElementById('screenTitle');

    if (formLogin) formLogin.classList.add('hidden');
    if (formCadastro) formCadastro.classList.remove('hidden');
    if (screenTitle) screenTitle.textContent = 'Criar sua Conta';
}

function showLogin() {
    const formCadastro = document.getElementById('formCadastro');
    const stepPerfil = document.getElementById('stepPerfil');
    const stepResponsavel = document.getElementById('stepResponsavel');
    const formLogin = document.getElementById('formLogin');
    const screenTitle = document.getElementById('screenTitle');

    if (formCadastro) formCadastro.classList.add('hidden');
    if (stepPerfil) stepPerfil.classList.add('hidden');
    if (stepResponsavel) stepResponsavel.classList.add('hidden');
    if (screenTitle) {
        screenTitle.classList.remove('hidden');
        screenTitle.textContent = 'Entrar no App';
    }
    if (formLogin) formLogin.classList.remove('hidden');
}

function backToCadastro() {
    const stepPerfil = document.getElementById('stepPerfil');
    const screenTitle = document.getElementById('screenTitle');
    const formCadastro = document.getElementById('formCadastro');

    if (stepPerfil) stepPerfil.classList.add('hidden');
    if (screenTitle) screenTitle.classList.remove('hidden');
    if (formCadastro) formCadastro.classList.remove('hidden');
}

function backToPerfil() {
    const stepResponsavel = document.getElementById('stepResponsavel');
    const stepPerfil = document.getElementById('stepPerfil');

    if (stepResponsavel) stepResponsavel.classList.add('hidden');
    if (stepPerfil) stepPerfil.classList.remove('hidden');
}

let tempUserData = {};

function setupForms() {
    // 1. LOGIN
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail');
            const senhaInput = document.getElementById('loginSenha');
            if (!emailInput || !senhaInput) return;

            const email = emailInput.value.trim().toLowerCase();
            const senha = senhaInput.value;

            const registeredUsers = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const user = registeredUsers.find(u => u.email && u.email.toLowerCase() === email);

            if (user) {
                if (user.senha === senha) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
                    redirectToRolePage(user.perfil);
                } else {
                    alert('Senha incorreta!');
                }
            } else {
                alert('E-mail não encontrado!');
            }
        });
    }

    // 2. CADASTRO GERAL
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

            tempUserData = {
                name: document.getElementById('nome').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefone: document.getElementById('telefone').value,
                cpf: document.getElementById('cpf').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
                bairro: document.getElementById('bairro').value,
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value,
                senha: senha
            };

            document.getElementById('formCadastro').classList.add('hidden');
            document.getElementById('screenTitle').classList.add('hidden');
            document.getElementById('stepPerfil').classList.remove('hidden');
        });
    }

    // 3. RESPONSÁVEL: VINCULAR CPF IDOSO
    const formCpfIdoso = document.getElementById('formCpfIdoso');
    if (formCpfIdoso) {
        formCpfIdoso.addEventListener('submit', (e) => {
            e.preventDefault();
            tempUserData.cpfIdosoVinculado = document.getElementById('cpfIdosoExistente').value.trim();
            finalizarCadastroResponsavel();
        });
    }

    // 4. RESPONSÁVEL: CADASTRAR NOVO IDOSO
    const formCadastroIdoso = document.getElementById('formCadastroIdoso');
    if (formCadastroIdoso) {
        formCadastroIdoso.addEventListener('submit', (e) => {
            e.preventDefault();

            const novoIdoso = {
                name: document.getElementById('nomeIdoso').value.trim(),
                email: document.getElementById('emailIdoso').value.trim(),
                telefone: document.getElementById('telefoneIdoso').value,
                cpf: document.getElementById('cpfIdosoNovo').value,
                senha: document.getElementById('senhaIdoso').value,
                perfil: 'Idoso'
            };

            const registeredUsers = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            registeredUsers.push(novoIdoso);
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(registeredUsers));

            tempUserData.cpfIdosoVinculado = novoIdoso.cpf;
            alert(`O idoso ${novoIdoso.name} foi cadastrado com sucesso!`);

            finalizarCadastroResponsavel();
        });
    }
}

function selectPerfil(perfil) {
    tempUserData.perfil = perfil;

    if (perfil === 'Responsável') {
        document.getElementById('stepPerfil').classList.add('hidden');
        document.getElementById('stepResponsavel').classList.remove('hidden');
    } else {
        const registeredUsers = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
        registeredUsers.push(tempUserData);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(registeredUsers));

        alert(`Cadastro realizado com sucesso como "${perfil}"! Faça seu login.`);
        showLogin();
        const loginEmail = document.getElementById('loginEmail');
        if (loginEmail) loginEmail.value = tempUserData.email;
    }
}

function toggleFormularioIdoso(opcao) {
    const formCpf = document.getElementById('formCpfIdoso');
    const formCad = document.getElementById('formCadastroIdoso');

    if (opcao === 'sim') {
        if (formCpf) formCpf.classList.remove('hidden');
        if (formCad) formCad.classList.add('hidden');
    } else {
        if (formCpf) formCpf.classList.add('hidden');
        if (formCad) formCad.classList.remove('hidden');
    }
}

function finalizarCadastroResponsavel() {
    const registeredUsers = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    registeredUsers.push(tempUserData);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(registeredUsers));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempUserData));
    window.location.href = 'responsavel.html';
}

function redirectToRolePage(perfil) {
    if (perfil === 'Ajudante' || perfil === 'Voluntário') {
        window.location.href = 'voluntario.html';
    } else if (perfil === 'Responsável') {
        window.location.href = 'responsavel.html';
    } else {
        window.location.href = 'home.html';
    }
}

// --- FUNÇÕES DE SINCRONIZAÇÃO EM TEMPO REAL PARA DEMONSTRAÇÃO ---

// Registra um alerta direto do idoso ao responsável
function criarAlertaIdoso(tipo, mensagem) {
    const alertas = JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]');
    const novoAlerta = {
        id: Date.now(),
        tipo: tipo,
        mensagem: mensagem,
        horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: 'Hoje',
        status: 'Pendente'
    };
    alertas.unshift(novoAlerta);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alertas));
}

// Registra uma nova solicitação de serviço realizada pelo idoso
function criarServicoIdoso(servico, icone) {
    const servicos = JSON.parse(localStorage.getItem(SERVICES_KEY) || '[]');
    const novoServico = {
        id: Date.now(),
        servico: servico,
        icone: icone,
        horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: 'Hoje',
        voluntario: 'Aguardando Voluntário...',
        status: 'Pendente',
        avaliacao: 'Aguardando'
    };
    servicos.unshift(novoServico);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(servicos));
}