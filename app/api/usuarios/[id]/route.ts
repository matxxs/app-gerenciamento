// app/api/usuarios/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database';

interface Usuario {
    id_usuario: number;
    id_funcao: number;
    id_empresa: number;
    nome_completo: string;
    email: string;
    ativo: boolean;
    
}

export interface Usuario_Tela_Acesso
{
    id_tela: number;
    pode_criar: boolean;
    pode_ler: boolean;
    pode_atualizar: boolean;
    pode_deletar: boolean;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }

    try {
        const pool = await getPool();
        const userResult = await pool.request()
            .input('id_usuario', sql.Int, userId)
            .query<Usuario>(`
                SELECT 
                    id_usuario, id_empresa, id_funcao, nome_completo, email, ativo
                FROM Usuarios
                WHERE id_usuario = @id_usuario;
            `); 
        if (userResult.recordset.length === 0) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }
        const usuario = userResult.recordset[0];

        const telasResult = await pool.request()
            .input('id_usuario', sql.Int, usuario.id_usuario)
            .query<Usuario_Tela_Acesso>(`
                SELECT 
                    id_tela, 
                    pode_criar, 
                    pode_ler, 
                    pode_atualizar, 
                    pode_deletar 
                FROM Usuario_Tela_Acesso WHERE id_usuario = @id_usuario;
            `);
        const telasAcesso = telasResult.recordset;
        return NextResponse.json({ data: { ...usuario, telasAcesso } });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return NextResponse.json({ message: 'Erro ao buscar usuário.' }, { status: 500 });
    }  
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }
    try {
        const pool = await getPool();
        const deleteResult = await pool.request()
            .input('id_usuario', sql.Int, userId)
            .query(`
                DELETE FROM Usuarios
                WHERE id_usuario = @id_usuario;
            `);
        if (deleteResult.rowsAffected[0] === 0) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        return NextResponse.json({ message: 'Erro ao deletar usuário.' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }

    const { nome_completo, email, ativo, id_funcao } = await request.json();
    if (!nome_completo || !email || ativo === undefined || !id_funcao) {
        return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    try {
        const pool = await getPool();
        const updateResult = await pool.request()
            .input('id_usuario', sql.Int, userId)
            .input('nome_completo', sql.VarChar, nome_completo)
            .input('email', sql.VarChar, email)
            .input('ativo', sql.Bit, ativo)
            .input('id_funcao', sql.Int, id_funcao)
            .query(`
                UPDATE Usuarios
                SET nome_completo = @nome_completo,
                    email = @email,
                    ativo = @ativo,
                    id_funcao = @id_funcao
                WHERE id_usuario = @id_usuario;
            `);
        if (updateResult.rowsAffected[0] === 0) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        return NextResponse.json({ message: 'Erro ao atualizar usuário.' }, { status: 500 });
    }
}