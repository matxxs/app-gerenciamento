// //  app/api/auth/login/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { getPool, sql } from '@/config/database'; 
// import { Usuario } from "@/lib/types";
// // import bcrypt from 'bcryptjs';
// // import jwt from 'jsonwebtoken';



// export async function POST(request: NextRequest) {
//   try {
//     const { email, senha } = await request.json();

//     if (!email || !senha) {
//       return NextResponse.json({ message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
//     }

//     const pool = await getPool();

//     // 1. Busca o usuário pelo e-mail
//     const userResult = await pool.request()
//       .input('email', sql.VarChar, email)
//       .query<Usuario>(`
//           SELECT 
//               u.id_usuario, u.id_empresa, u.nome_completo, u.email, u.senha_hash, u.ativo,
//               f.id_funcao, f.nome_funcao, f.pode_ver_todas_filiais
//           FROM Usuarios u
//           JOIN Funcoes f ON u.id_funcao = f.id_funcao
//           WHERE u.email = @email;
//       `);

//     if (userResult.recordset.length === 0) {
//       return NextResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
//     }

//     const usuario = userResult.recordset[0];

//     if (!usuario.ativo) {
//       return NextResponse.json({ message: 'Este usuário está inativo.' }, { status: 403 });
//     }

//     // 2. Compara a senha enviada com o hash salvo no banco (ESSENCIAL)
//     // const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
//     // if (!senhaValida) {
//     //   return NextResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
//     // }

//     // Remover o hash da senha do objeto antes de continuar
//     const { senha_hash, ...usuarioSemSenha } = usuario;

//     // 3. Busca as permissões de tela do usuário
//     const telasResult = await pool.request()
//         .input('id_funcao', sql.Int, usuario.id_funcao)
//         .input('id_usuario', sql.Int, usuario.id_usuario)
//         .query(`
//                 WITH RolePermissions AS (
//                     SELECT id_tela, pode_criar, pode_ler, pode_atualizar, pode_deletar
//                     FROM Funcao_Tela_Acesso
//                     WHERE id_funcao = @id_funcao
//                 ),
//                 UserPermissions AS (
//                     SELECT id_tela, pode_criar, pode_ler, pode_atualizar, pode_deletar
//                     FROM Usuario_Tela_Acesso
//                     WHERE id_usuario = @id_usuario
//                 )
//                 SELECT
//                     t.id_tela,
//                     t.nome_tela,
//                     t.descricao,
//                     CONVERT(BIT, ISNULL(up.pode_criar, rp.pode_criar)) as pode_criar,
//                     CONVERT(BIT, ISNULL(up.pode_ler, rp.pode_ler)) as pode_ler,
//                     CONVERT(BIT, ISNULL(up.pode_atualizar, rp.pode_atualizar)) as pode_atualizar,
//                     CONVERT(BIT, ISNULL(up.pode_deletar, rp.pode_deletar)) as pode_deletar
//                 FROM Telas t
//                 LEFT JOIN RolePermissions rp ON t.id_tela = rp.id_tela
//                 LEFT JOIN UserPermissions up ON t.id_tela = up.id_tela
//                 WHERE rp.id_tela IS NOT NULL OR up.id_tela IS NOT NULL;
//         `);
    
//     const telasAcesso = telasResult.recordset;

//     let filiaisAcesso = [];
//     if (usuario.pode_ver_todas_filiais) {
//         const todasFiliaisResult = await pool.request()
//             .input('id_empresa', sql.Int, usuario.id_empresa)
//             .query('SELECT id_filial, nome_filial FROM Filiais WHERE id_empresa = @id_empresa AND ativo = 1;');
//         filiaisAcesso = todasFiliaisResult.recordset;
//     } else {
//         const filiaisVinculadasResult = await pool.request()
//             .input('id_usuario_filial', sql.Int, usuario.id_usuario)
//             .query(`
//                 SELECT f.id_filial, f.nome_filial 
//                 FROM Filiais f
//                 JOIN Usuario_Filial_Acesso ufa ON f.id_filial = ufa.id_filial
//                 WHERE ufa.id_usuario = @id_usuario_filial AND f.ativo = 1;
//             `);
//         filiaisAcesso = filiaisVinculadasResult.recordset;
//     }

//     // 5. Gerar o Token JWT para a sessão do usuário
//     // const secret = process.env.JWT_SECRET;
//     // if (!secret) {
//     //     throw new Error('A chave secreta JWT_SECRET não está definida no .env');
//     // }
//     // const token = jwt.sign(
//     //     { 
//     //         id: usuario.id_usuario, 
//     //         nome: usuario.nome_completo,
//     //         email: usuario.email,
//     //         funcao: usuario.nome_funcao
//     //     }, 
//     //     secret, 
//     //     { expiresIn: '8h' } // Token expira em 8 horas
//     // );
    
//     // 6. Retornar a resposta completa
//     return NextResponse.json({
//       // token,
//       usuario: usuarioSemSenha,
//       permissoes: {
//         telas: telasAcesso,
//         filiais: filiaisAcesso,
//       },
//     });

//   } catch (error) {
//     console.error('Erro na rota de autenticação:', error);
//     return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database';
import { TelaPermissao, TelaPermissaoNode, Usuario } from "@/lib/types";

// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';


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
            return NextResponse.json({ message: 'Este usuário está inativo.' }, { status: 403 });
        }

        // 2. Compara a senha (lógica mantida)
        // const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        // if (!senhaValida) { ... }

        const { senha_hash, ...usuarioSemSenha } = usuario;

        // 3. NOVA QUERY para buscar as permissões de tela de forma hierárquica
        const telasResult = await pool.request()
            .input('id_funcao', sql.Int, usuario.id_funcao)
            .input('id_usuario', sql.Int, usuario.id_usuario)
            .query<TelaPermissao>(`
                WITH BasePermissions AS (
                    -- Combina as permissões da função e do usuário, dando prioridade às do usuário
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
                    -- Âncora: Seleciona as telas que o usuário tem permissão direta de leitura
                    SELECT id_tela FROM BasePermissions WHERE pode_ler = 1
                    
                    UNION ALL
                    
                    -- Recursão: Busca os pais das telas encontradas, subindo na hierarquia
                    SELECT t.id_tela_pai
                    FROM Telas t
                    INNER JOIN MenuHierarchy mh ON t.id_tela = mh.id_tela
                    WHERE t.id_tela_pai IS NOT NULL
                )
                -- Seleção Final: Busca todos os dados das telas da hierarquia
                SELECT DISTINCT
                    t.id_tela,
                    t.id_tela_pai,
                    t.titulo,
                    t.chave_tela,
                    t.descricao,
                    t.rota,
                    t.icone,
                    t.ordem,
                    -- As permissões CRUD vêm da BasePermissions, para os pais será o padrão (apenas leitura para exibir o menu)
                    CONVERT(BIT, ISNULL(bp.pode_criar, 0)) as pode_criar,
                    CONVERT(BIT, ISNULL(bp.pode_ler, 1)) as pode_ler, -- Garante que menus pais sejam legíveis
                    CONVERT(BIT, ISNULL(bp.pode_atualizar, 0)) as pode_atualizar,
                    CONVERT(BIT, ISNULL(bp.pode_deletar, 0)) as pode_deletar
                FROM Telas t
                JOIN MenuHierarchy mh ON t.id_tela = mh.id_tela
                LEFT JOIN BasePermissions bp ON t.id_tela = bp.id_tela
                WHERE t.ativo = 1;
            `);

        // 4. Constrói a árvore de menus a partir do resultado plano da query
        const menuTree = buildMenuTree(telasResult.recordset);

        // 5. Busca as filiais de acesso (sem alterações aqui)
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
                    SELECT f.id_filial, f.nome_filial
                    FROM Filiais f
                    JOIN Usuario_Filial_Acesso ufa ON f.id_filial = ufa.id_filial
                    WHERE ufa.id_usuario = @id_usuario_filial AND f.ativo = 1;
                `);
            filiaisAcesso = filiaisVinculadasResult.recordset;
        }

        // 6. Gerar o Token JWT (lógica mantida)
        // const token = jwt.sign(...);

        // 7. Retornar a resposta completa com a árvore de menus
        return NextResponse.json({
            // token,
            usuario: usuarioSemSenha,
            permissoes: {
                telas: menuTree, // << AQUI ESTÁ A MUDANÇA PRINCIPAL
                filiais: filiaisAcesso,
            },
        });

    } catch (error) {
        console.error('Erro na rota de autenticação:', error);
        return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
    }
}