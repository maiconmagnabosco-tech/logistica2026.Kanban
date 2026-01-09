// Configuração de Autenticação e Permissões
const AUTH_DOMAIN = '@transmagnabosco.com.br';

// Lista de usuários permitidos, senhas e permissões
const USER_PERMISSIONS = {
    // Usuário geral
    'magnabosco': {
        name: 'Magnabosco',
        password: '1234',
        access: 'move_own' // Usuário geral: pode mover apenas seus próprios cards
    },
    'maicon.amaral@transmagnabosco.com.br': {
        name: 'Maicon',
        password: 'M@na21',
        access: 'full' // Acesso total: criar, editar, deletar, mover todos os cards
    },
    'maxsuel.salvador@transmagnabosco.com.br': {
        name: 'Maxsuel',
        password: 'M@gna11',
        access: 'full' // Acesso total
    },
    'kaua.andreis@transmagnabosco.com.br': {
        name: 'Kaua',
        password: 'M@gna10',
        access: 'move_own' // Pode mover apenas seus próprios cards
    },
    'mauricio.almeida@transmagnabosco.com.br': {
        name: 'Mauricio',
        password: 'M@gna33',
        access: 'move_own' // Pode mover apenas seus próprios cards
    },
    'iago.spazzini@transmagnabosco.com.br': {
        name: 'Iago',
        password: 'M@gna99',
        access: 'move_own' // Pode mover apenas seus próprios cards
    },
    'lucas.bittencourt@transmagnabosco.com.br': {
        name: 'Lucas',
        password: 'M@gna09',
        access: 'full' // Acesso total
    },
    'guilherme.magnabosco@transmagnabosco.com.br': {
        name: 'Guilherme',
        password: 'M@gna041023',
        access: 'full' // Acesso total
    }
};

// Função para validar senha do usuário
function validateUserPassword(emailOrLogin, password) {
    const loginLower = emailOrLogin.toLowerCase().trim();
    const user = USER_PERMISSIONS[loginLower];
    
    if (!user) {
        return false;
    }
    
    return user.password === password;
}

// Obter permissões do usuário atual
function getUserPermissions() {
    const userEmailOrLogin = localStorage.getItem('kanban_user');
    if (!userEmailOrLogin) return null;
    
    const loginLower = userEmailOrLogin.toLowerCase();
    const perms = USER_PERMISSIONS[loginLower];
    
    if (perms) {
        return {
            email: loginLower.includes('@') ? loginLower : loginLower, // Mantém o login mesmo sem @
            name: perms.name,
            access: perms.access
        };
    }
    
    // Se não estiver na lista, retornar acesso mínimo
    return {
        email: loginLower,
        name: loginLower.includes('@') ? loginLower.split('@')[0].split('.')[0] : loginLower,
        access: 'view_only'
    };
}

// Verificar se usuário tem uma permissão específica
function hasPermission(permission) {
    const userPerms = getUserPermissions();
    if (!userPerms) return false;
    
    if (userPerms.access === 'full') return true;
    if (permission === 'view') return true; // Todos podem visualizar
    return false;
}

// Verificar se pode mover um card específico
function canMoveCard(task) {
    const userPerms = getUserPermissions();
    if (!userPerms || !task) return false;
    
    if (userPerms.access === 'view_only') return false; // Usuário de visualização não pode mover
    if (userPerms.access === 'full') return true;
    if (userPerms.access === 'move_own') {
        // Pode mover apenas se for o responsável
        const userEmail = userPerms.email;
        const userName = userPerms.name.toLowerCase();
        const taskResponsible = task.responsible ? task.responsible.toLowerCase() : '';
        
        // Verificar se o nome do responsável corresponde ao usuário
        return taskResponsible.includes(userName) || 
               userName.includes(taskResponsible.split(' ')[0]) ||
               taskResponsible.includes(userEmail.split('@')[0].split('.')[0]);
    }
    return false;
}

// Verificar se pode editar um card específico
function canEditCard(task) {
    const userPerms = getUserPermissions();
    if (!userPerms || !task) return false;
    
    if (userPerms.access === 'view_only') return false; // Usuário de visualização não pode editar
    if (userPerms.access === 'full') return true;
    return false; // Apenas full access pode editar
}

// Verificar se pode deletar um card específico
function canDeleteCard(task) {
    const userPerms = getUserPermissions();
    if (!userPerms || !task) return false;
    
    if (userPerms.access === 'view_only') return false; // Usuário de visualização não pode deletar
    
    // Apenas maicon.amaral@transmagnabosco.com.br pode deletar
    if (userPerms.email === 'maicon.amaral@transmagnabosco.com.br') {
        return true;
    }
    
    return false;
}

// Verificar se pode criar novos cards
function canCreateCard() {
    const userPerms = getUserPermissions();
    if (!userPerms) return false;
    
    if (userPerms.access === 'view_only') return false; // Usuário de visualização não pode criar
    return userPerms.access === 'full';
}





