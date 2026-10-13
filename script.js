// CONFIGURAÇÃO DO FIREBASE (Projeto lacoamigo-b498f)
const firebaseConfig = {
  apiKey: "AIzaSyClec_7x_jR1O7MYS7wZOLu_CSDUeNGQ1Q",
  authDomain: "laco-amigo.firebaseapp.com",
  databaseURL: "https://laco-amigo-default-rtdb.firebaseio.com",
  projectId: "laco-amigo",
  storageBucket: "laco-amigo.firebasestorage.app",
  messagingSenderId: "1034440780614",
  appId: "1:1034440780614:web:57061cfbdbc50b345b1347",
  measurementId: "G-3Y09NLWNXC"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.database() : null;

const STORAGE_KEY = 'laco_amigo_user_session';
let tempUserData = {};

const PRESET_USERS = [
    { name: 'Maria da Silva', email: 'idoso@teste.com', senha: '12345678', perfil: 'Idoso', telefone: '(81) 98888-1111', cpf: '111.222.333-44' },
    { name: 'João da Silva', email: 'responsavel@teste.com', senha: '12345678', perfil: 'Responsável', telefone: '(81) 98888-2222', cpf: '555.666.777-88', cpfIdosoVinculado: '111.222.333-44' },
    { name: 'Carlos Silva', email: 'voluntario@teste.com', senha: '12345678', perfil: 'Voluntário', telefone: '(81) 98888-3333', cpf: '999.888.777-66' }
];

document.addEventListener('DOMContentLoaded', () => {
    initPresetUsers();
    setupForms();
});

function initPresetUsers() {
    if (!db) return;
    db.ref('users').once('value', snapshot => {
        if (!snapshot.exists()) {
            PRESET_USERS.forEach(user => db.ref('users').push(user));
        }
    });
}

function showCadastro() {
    document.getElementById('formLogin')?.classList.add('hidden');
    document.getElementById('formCadastro')?.classList.remove('hidden');
    const screenTitle = document.getElementById('screenTitle');
    if (screenTitle) screenTitle.textContent = 'Criar sua Conta';
}

function showLogin() {
    document.getElementById('formCadastro')?.classList.add('hidden');
    document.getElementById('stepPerfil')?.classList.add('hidden');
    document.getElementById('stepResponsavel')?.classList.add('hidden');
    const screenTitle = document.getElementById('screenTitle');
    if (screenTitle) {
        screenTitle.classList.remove('hidden');
        screenTitle.textContent = 'Entrar no App';
    }
    document.getElementById('formLogin')?.classList.remove('hidden');
}

function backToCadastro() {
    document.getElementById('stepPerfil')?.classList.add('hidden');
    document.getElementById('screenTitle')?.classList.remove('hidden');
    document.getElementById('formCadastro')?.classList.remove('hidden');
}

function backToPerfil() {
    document.getElementById('stepResponsavel')?.classList.add('hidden');
    document.getElementById('stepPerfil')?.classList.remove('hidden');
}

function togglePasswordVisibility(id) {
    const field = document.getElementById(id);
    if (field) field.type = field.type === 'password' ? 'text' : 'password';
}

function setupForms() {
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
            const senha = document.getElementById('loginSenha')?.value;

            if (!email || !senha) return alert('Preencha todos os campos!');

            try {
                if (db) {
                    const snapshot = await db.ref('users').once('value');
                    const usersObj = snapshot.val() || {};
                    const usersList = Object.values(usersObj);
                    const user = usersList.find(u => u.email && u.email.toLowerCase() === email);

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
                }
            } catch (err) {
                console.error(err);
                alert('Erro na conexão.');
            }
        });
    }

    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            const senha = document.getElementById('senha').value;
            if (senha !== document.getElementById('confirmarSenha').value) {
                return alert('As senhas não coincidem!');
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
            document.getElementById('screenTitle')?.classList.add('hidden');
            document.getElementById('stepPerfil').classList.remove('hidden');
        });
    }

    const formCpfIdoso = document.getElementById('formCpfIdoso');
    if (formCpfIdoso) {
        formCpfIdoso.addEventListener('submit', async (e) => {
            e.preventDefault();
            tempUserData.cpfIdosoVinculado = document.getElementById('cpfIdosoExistente').value.trim();
            await finalizarCadastro();
        });
    }

    const formCadastroIdoso = document.getElementById('formCadastroIdoso');
    if (formCadastroIdoso) {
        formCadastroIdoso.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novoIdoso = {
                name: document.getElementById('nomeIdoso').value.trim(),
                email: document.getElementById('emailIdoso').value.trim(),
                telefone: document.getElementById('telefoneIdoso').value,
                cpf: document.getElementById('cpfIdosoNovo').value,
                senha: document.getElementById('senhaIdoso').value,
                perfil: 'Idoso'
            };

            if (db) await db.ref('users').push(novoIdoso);
            tempUserData.cpfIdosoVinculado = novoIdoso.cpf;
            tempUserData.nomeIdosoVinculado = novoIdoso.name;
            await finalizarCadastro();
        });
    }
}

// Função atualizada como ASYNC para tratar a chamada assíncrona do Firebase
async function selectPerfil(perfil) {
    tempUserData.perfil = perfil;

    if (perfil === 'Responsável') {
        document.getElementById('stepPerfil')?.classList.add('hidden');
        document.getElementById('stepResponsavel')?.classList.remove('hidden');
    } else {
        await finalizarCadastro();
    }
}

async function finalizarCadastro() {
    // 1. Tenta salvar no Firebase se a conexão estiver configurada
    if (db) {
        try {
            await db.ref('users').push(tempUserData);
        } catch (err) {
            console.warn('Não foi possível salvar no Firebase, prosseguindo localmente:', err);
        }
    }

    // 2. Salva a sessão do usuário no navegador para manter o login ativo
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempUserData));

    // 3. Redireciona imediatamente para a tela correspondente ao perfil
    redirectToRolePage(tempUserData.perfil);
}
function toggleFormularioIdoso(opcao) {
    document.getElementById('formCpfIdoso')?.classList.toggle('hidden', opcao !== 'sim');
    document.getElementById('formCadastroIdoso')?.classList.toggle('hidden', opcao !== 'nao');
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

// TRANSMISSÃO FIREBASE EM TEMPO REAL
function criarAlertaIdoso(tipo, mensagem, nomeIdoso) {
    if (!db) return;
    db.ref('alerts').push({
        tipo: tipo,
        mensagem: mensagem,
        nomeIdoso: nomeIdoso || 'Idoso',
        horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: 'Hoje',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

function criarServicoIdoso(servico, icone, nomeIdoso) {
    if (!db) return;
    db.ref('services').push({
        servico: servico,
        icone: icone,
        nomeIdoso: nomeIdoso || 'Idoso',
        horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: 'Hoje',
        voluntario: 'Aguardando Voluntário...',
        status: 'Pendente',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

function ouvirAlertasEmTempoReal(callback) {
    if (!db) return;
    db.ref('alerts').on('value', snapshot => {
        const data = snapshot.val() || {};
        const lista = Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse();
        callback(lista);
    });
}

function ouvirServicosEmTempoReal(callback) {
    if (!db) return;
    db.ref('services').on('value', snapshot => {
        const data = snapshot.val() || {};
        const lista = Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse();
        callback(lista);
    });
}
