// /api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database';
import { TelaPermissao, TelaPermissaoNode, Usuario } from "@/lib/types";

// ... (sua função buildMenuTree permanece a mesma) ...
function buildMenuTree(list: TelaPermissao[]): TelaPermissaoNode[] {
    const map: { [key: number]: TelaPermissaoNode } = {};
    const roots: TelaPermissaoNode[] = [];
    list.forEach(item => {
        map[item.id_tela] = { ...item, filhos: [] };
    });
    list.forEach(item => {
        const node = map[item.id_tela];
        if (item.id_tela_pai && map[item.id_tela_pai]) {
            map[item.id_tela_pai].filhos.push(node);
        } else {
            roots.push(node);
        }
    });
    const sortChildren = (node: TelaPermissaoNode) => {
        node.filhos.sort((a, b) => a.ordem - b.ordem);
        node.filhos.forEach(sortChildren);
    };
    roots.forEach(sortChildren);
    roots.sort((a, b) => a.ordem - b.ordem);
    return roots;
}


export async function POST(request: NextRequest) {
    try {
        const { email, senha } = await request.json();

        if (!email || !senha) {
            return NextResponse.json({ message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
        }

        const pool = await getPool();

        const userResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query<Usuario>(`
                SELECT
                    u.id_usuario, u.id_empresa, u.nome_completo, u.email, u.senha_hash, u.ativo,
                    f.id_funcao, f.nome_funcao, f.pode_ver_todas_filiais
                FROM Usuarios u
                JOIN Funcoes f ON u.id_funcao = f.id_funcao
                WHERE u.email = @email;
            `);

        if (userResult.recordset.length === 0) {
            return NextResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
        }

        const usuario = userResult.recordset[0];

        if (!usuario.ativo) {
            return NextResponse.json({ message: 'Este usuário está inativo. Entre em contato com Gerente ou Administrador do sistema' }, { status: 403 });
        }

        // TODO: Implementar comparação de senha real (ex: bcrypt)
        // const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        // if (!senhaValida) { ... }

        const { senha_hash, ...usuarioSemSenha } = usuario;

        let menuTree: TelaPermissaoNode[];

        // AJUSTE: Corrigido o nome da função para 'Administrador de Sistema'
        if (usuario.nome_funcao === 'Administrador de Sistema') {
            const adminTelasResult = await pool.request()
                .query<TelaPermissao>(`
                    SELECT 
                        id_tela, id_tela_pai, titulo, chave_tela, descricao, rota, icone, ordem,
                        CONVERT(BIT, 1) as pode_criar, CONVERT(BIT, 1) as pode_ler,
                        CONVERT(BIT, 1) as pode_atualizar, CONVERT(BIT, 1) as pode_deletar
                    FROM Telas WHERE ativo = 1;
                `);
            menuTree = buildMenuTree(adminTelasResult.recordset);
        } else {
            // A query para outros usuários já estava correta, buscando permissões específicas.
            const telasResult = await pool.request()
                .input('id_funcao', sql.Int, usuario.id_funcao)
                .input('id_usuario', sql.Int, usuario.id_usuario)
                .query<TelaPermissao>(`
                    WITH BasePermissions AS (
                        SELECT 
                            t.id_tela,
                            COALESCE(up.pode_criar, rp.pode_criar, 0) AS pode_criar,
                            COALESCE(up.pode_ler, rp.pode_ler, 0) AS pode_ler,
                            COALESCE(up.pode_atualizar, rp.pode_atualizar, 0) AS pode_atualizar,
                            COALESCE(up.pode_deletar, rp.pode_deletar, 0) AS pode_deletar
                        FROM Telas t
                        LEFT JOIN Funcao_Tela_Acesso rp ON t.id_tela = rp.id_tela AND rp.id_funcao = @id_funcao
                        LEFT JOIN Usuario_Tela_Acesso up ON t.id_tela = up.id_tela AND up.id_usuario = @id_usuario
                        WHERE (rp.id_tela IS NOT NULL OR up.id_tela IS NOT NULL) AND t.ativo = 1
                    ),
                    MenuHierarchy AS (
                        SELECT id_tela FROM BasePermissions WHERE pode_ler = 1
                        UNION ALL
                        SELECT t.id_tela_pai FROM Telas t
                        INNER JOIN MenuHierarchy mh ON t.id_tela = mh.id_tela
                        WHERE t.id_tela_pai IS NOT NULL
                    )
                    SELECT DISTINCT
                        t.id_tela, t.id_tela_pai, t.titulo, t.chave_tela, t.descricao, t.rota, t.icone, t.ordem,
                        CONVERT(BIT, ISNULL(bp.pode_criar, 0)) as pode_criar,
                        CONVERT(BIT, ISNULL(bp.pode_ler, 1)) as pode_ler, /* Pais de menu devem ser legíveis */
                        CONVERT(BIT, ISNULL(bp.pode_atualizar, 0)) as pode_atualizar,
                        CONVERT(BIT, ISNULL(bp.pode_deletar, 0)) as pode_deletar
                    FROM Telas t
                    JOIN MenuHierarchy mh ON t.id_tela = mh.id_tela
                    LEFT JOIN BasePermissions bp ON t.id_tela = bp.id_tela
                    WHERE t.ativo = 1;
                `);
            menuTree = buildMenuTree(telasResult.recordset);
        }        

        // Lógica para buscar filiais (permanece igual)
        let filiaisAcesso = [];
        if (usuario.pode_ver_todas_filiais) {
            const todasFiliaisResult = await pool.request()
                .input('id_empresa', sql.Int, usuario.id_empresa)
                .query('SELECT id_filial, nome_filial FROM Filiais WHERE id_empresa = @id_empresa AND ativo = 1;');
            filiaisAcesso = todasFiliaisResult.recordset;
        } else {
            const filiaisVinculadasResult = await pool.request()
                .input('id_usuario_filial', sql.Int, usuario.id_usuario)
                .query(`
                    SELECT f.id_filial, f.nome_filial FROM Filiais f
                    JOIN Usuario_Filial_Acesso ufa ON f.id_filial = ufa.id_filial
                    WHERE ufa.id_usuario = @id_usuario_filial AND f.ativo = 1;
                `);
            filiaisAcesso = filiaisVinculadasResult.recordset;
        }

        return NextResponse.json({
            // token, // Token comentado conforme solicitado
            usuario: usuarioSemSenha,
            permissoes: {
                telas: menuTree,
                filiais: filiaisAcesso,
            },
        });

    } catch (error) {
        console.error('Erro na rota de autenticação:', error);
        return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
    }
}