// Interface para os dados do usuário que vêm da API
export interface Usuario {
  id_usuario: number;
  id_empresa: number;
  nome_completo: string;
  email: string;
  senha_hash: string;
  ativo: boolean;
  id_funcao: number;
  nome_funcao: string;
  pode_ver_todas_filiais: boolean;
}

export interface UsuarioLista {
  id_usuario: number;
  nome_completo: string;
  email: string;
  ativo: boolean;
  nome_funcao: string;
}

// Interface para cada tela que o usuário pode acessar
export interface TelaPermissao {
    id_tela: number;
    id_tela_pai: number | null;
    titulo: string;
    chave_tela: string;
    descricao: string | null;
    rota: string | null;
    icone: string | null;
    ordem: number;
    pode_criar: boolean;
    pode_ler: boolean;
    pode_atualizar: boolean;
    pode_deletar: boolean;
}

export interface TelaPermissaoNode extends TelaPermissao {
    filhos: TelaPermissaoNode[];
}

// Interface para as filiais que o usuário pode acessar
export interface Filial {
  id_filial: number;
  nome_filial: string;
}

// Objeto que agrupa todas as permissões
export interface Permissoes {
  telas: TelaPermissaoNode[];
  filiais: Filial[];
}

// Interface para o estado de autenticação no Redux
export interface AuthState {
  user: Usuario | null;
  permissions: Permissoes | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}