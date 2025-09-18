// /api/usuarios/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database'; 
import { Usuario, UsuarioLista, UsuarioTelaAcesso } from "@/lib/types";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idEmpresa = searchParams.get('id_empresa');

    const pool = await getPool();
    const requestPool = pool.request();

    let query = `
      SELECT 
        u.id_usuario, 
        u.id_empresa,
        u.nome_completo, 
        u.email, 
        u.ativo,
        f.nome_funcao,
        e.nome_fantasia as nome_empresa -- Adicionado para clareza na tela do Admin
      FROM Usuarios u
      JOIN Funcoes f ON u.id_funcao = f.id_funcao
      JOIN Empresas e ON u.id_empresa = e.id_empresa
    `;

    if (idEmpresa) {
      query += ` WHERE u.id_empresa = @id_empresa`;
      requestPool.input('id_empresa', sql.Int, idEmpresa);
    } else {
      query += ` WHERE e.cnpj != '00000000000000'`;
    }

    query += ` ORDER BY e.nome_fantasia, u.nome_completo;`;

    const result = await requestPool.query<UsuarioLista>(query);

    return NextResponse.json({ data: result.recordset });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    const body: Partial<Usuario> & { senha?: string, telasAcesso?: UsuarioTelaAcesso[] } = await request.json();
    const { 
        id_empresa, 
        nome_completo, 
        email, 
        senha, 
        id_funcao, 
        ativo = true, 
        telasAcesso = [] 
    } = body;

    if (!id_empresa || !nome_completo || !email || !senha || !id_funcao) {
        return NextResponse.json({ message: 'Campos obrigatórios estão faltando.' }, { status: 400 });
    }

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const senha_hash = await bcrypt.hash(senha, 10);

        const insertUserRequest = new sql.Request(transaction);
        const userResult = await insertUserRequest
            .input('id_empresa', sql.Int, id_empresa)
            .input('id_funcao', sql.Int, id_funcao)
            .input('nome_completo', sql.VarChar, nome_completo)
            .input('email', sql.VarChar, email)
            .input('senha_hash', sql.VarChar, senha_hash)
            .input('ativo', sql.Bit, ativo)
            .query(`
                INSERT INTO Usuarios (id_empresa, id_funcao, nome_completo, email, senha_hash, ativo)
                OUTPUT INSERTED.id_usuario
                VALUES (@id_empresa, @id_funcao, @nome_completo, @email, @senha_hash, @ativo);
            `);

        if (!userResult.recordset[0] || !userResult.recordset[0].id_usuario) {
            throw new Error("Falha ao criar o usuário e obter o ID.");
        }
        
        const newUserId = userResult.recordset[0].id_usuario;

        for (const tela of telasAcesso) {
            const insertPermissionRequest = new sql.Request(transaction);
            await insertPermissionRequest
                .input('id_usuario', sql.Int, newUserId)
                .input('id_tela', sql.Int, tela.id_tela)
                .input('pode_criar', sql.Bit, tela.pode_criar)
                .input('pode_ler', sql.Bit, tela.pode_ler)
                .input('pode_atualizar', sql.Bit, tela.pode_atualizar)
                .input('pode_deletar', sql.Bit, tela.pode_deletar)
                .query(`
                    INSERT INTO Usuario_Tela_Acesso (id_usuario, id_tela, pode_criar, pode_ler, pode_atualizar, pode_deletar) 
                    VALUES (@id_usuario, @id_tela, @pode_criar, @pode_ler, @pode_atualizar, @pode_deletar);
                `);
        }

        await transaction.commit();

        const newUserResponse = { id_usuario: newUserId, nome_completo, email, id_empresa };
        return NextResponse.json({ data: newUserResponse, message: 'Usuário criado com sucesso.' }, { status: 201 });

    } catch (error: unknown) {
        await transaction.rollback();
        console.error('Erro ao criar usuário:', error);

        if (typeof error === 'object' && error !== null && 'number' in error) {
            const dbError = error as { number: number };
            if (dbError.number === 2627 || dbError.number === 2601) {
                return NextResponse.json({ message: 'O e-mail fornecido já está em uso.' }, { status: 409 });
            }
        }
        return NextResponse.json({ message: 'Erro ao criar usuário.' }, { status: 500 });
    }
}