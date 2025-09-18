// =================================================================================
// TIPOS BASEADOS NO BANCO
// =================================================================================

// --- Empresas ---
export interface Empresa {
  id_empresa: number;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  data_criacao: Date;
  ativo: boolean;
}

// --- Filiais ---
export interface Filial {
  id_filial: number;
  id_empresa: number;
  nome_filial: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  data_criacao: Date;
  ativo: boolean;
  // Campos relacionados
  nome_empresa?: string;
}

// --- Funções ---
export interface Funcao {
  id_funcao: number;
  nome_funcao: string;
  descricao: string | null;
  pode_ver_todas_filiais: boolean;
}

// Interface para os dados detalhados de uma função, incluindo suas permissões
export interface FuncaoDetalhada extends Funcao {
  permissoes: {
    id_tela: number;
    pode_criar: boolean;
    pode_ler: boolean;
    pode_atualizar: boolean;
    pode_deletar: boolean;
  }[];
}

// --- Telas ---
export interface Tela {
  id_tela: number;
  id_tela_pai: number | null;
  titulo: string;
  chave_tela: string;
  descricao: string | null;
  rota: string | null;
  icone: string | null;
  ordem: number;
  ativo: boolean;
}

// --- Usuários ---
export interface Usuario {
  id_usuario: number;
  id_empresa: number;
  id_funcao: number;
  nome_completo: string;
  email: string;
  senha_hash?: string; // A senha hash não deve ser exposta no frontend
  data_criacao: Date;
  ativo: boolean;
  // Campos relacionados
  nome_empresa?: string;
  nome_funcao?: string;
  pode_ver_todas_filiais?: boolean;
}

// Interface para listas de usuários, exibindo apenas informações essenciais
export interface UsuarioLista {
  id_usuario: number;
  id_empresa: number;
  nome_completo: string;
  email: string;
  ativo: boolean;
  nome_funcao: string;
  nome_empresa: string;
}

// --- Permissões e Acesso ---

// Interface para a permissão de acesso de um usuário a uma tela específica
export interface UsuarioTelaAcesso {
  id_usuario: number;
  id_tela: number;
  pode_criar: boolean;
  pode_ler: boolean;
  pode_atualizar: boolean;
  pode_deletar: boolean;
}

// Interface para a permissão de acesso de uma função a uma tela específica
export interface FuncaoTelaAcesso {
  id_funcao: number;
  id_tela: number;
  pode_criar: boolean;
  pode_ler: boolean;
  pode_atualizar: boolean;
  pode_deletar: boolean;
}

// Interface para a estrutura de uma tela/módulo no sistema
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

// Representa uma TelaPermissao com seus filhos aninhados, para montar menus ou árvores de permissões
export interface TelaPermissaoNode extends TelaPermissao {
  filhos: TelaPermissaoNode[];
}

// Interface para acesso a filiais
export interface UsuarioFilialAcesso {
  id_usuario: number;
  id_filial: number;
}

// Objeto que agrupa todas as permissões do usuário logado
export interface Permissoes {
  telas: TelaPermissaoNode[];
  filiais: Filial[];
}

// --- Logs ---

// Interface para logs de login
export interface LogLogin {
  id_log_login: number;
  id_usuario: number | null;
  email_tentativa: string;
  ip_acesso: string | null;
  data_hora: Date;
  sucesso: boolean;
  user_agent: string | null;
  // Campos relacionados
  nome_usuario?: string;
}

// Interface para logs de ações
export interface LogAcao {
  id_log_acao: number;
  id_usuario: number;
  acao_realizada: string;
  detalhes: string | null;
  ip_acesso: string | null;
  data_hora: Date;
  // Campos relacionados
  nome_usuario?: string;
}

// --- Tipos para Formulários ---

// Tipos para criação/edição de empresas
export interface EmpresaForm {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  ativo: boolean;
}

// Tipos para criação/edição de filiais
export interface FilialForm {
  id_empresa: number;
  nome_filial: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  ativo: boolean;
}

// Tipos para criação/edição de funções
export interface FuncaoForm {
  nome_funcao: string;
  descricao?: string;
  pode_ver_todas_filiais: boolean;
}

// Tipos para criação/edição de usuários
export interface UsuarioForm {
  id_empresa: number;
  id_funcao: number;
  nome_completo: string;
  email: string;
  senha?: string;
  ativo: boolean;
  filiais_acesso?: number[];
}

// Tipos para criação/edição de telas
export interface TelaForm {
  id_tela_pai?: number;
  titulo: string;
  chave_tela: string;
  descricao?: string;
  rota?: string;
  icone?: string;
  ordem: number;
  ativo: boolean;
}

// --- Tipos para API ---

// Helper Type para a API, para padronizar as respostas
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Interface para paginação
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Tipos para o Estado do Redux/Context ---

// Interface para o estado de autenticação no Redux ou Context API
export interface AuthState {
  user: Usuario | null;
  permissions: Permissoes | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}