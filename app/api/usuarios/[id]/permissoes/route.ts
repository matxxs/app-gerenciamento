// /api/usuarios/[id]/permissoes/route.ts (exemplo de nome de arquivo)

import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database';
import { UsuarioTelaAcesso } from "@/lib/types";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const id_empresa: number = body.id_empresa;
    const telasAcesso: UsuarioTelaAcesso[] = body.telasAcesso;

    if (!id_empresa || !Array.isArray(telasAcesso)) {
        return NextResponse.json({ message: 'Formato de dados inválido. id_empresa e telasAcesso são obrigatórios.' }, { status: 400 });
    }

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();

        const checkUserRequest = new sql.Request(transaction);
        const userCheck = await checkUserRequest
            .input('id_usuario', sql.Int, userId)
            .input('id_empresa', sql.Int, id_empresa)
            .query('SELECT COUNT(1) as count FROM Usuarios WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa');

        if (userCheck.recordset[0].count === 0) {
            await transaction.rollback();
            return NextResponse.json({ message: 'Operação não permitida. O usuário não pertence à empresa especificada.' }, { status: 403 }); // Forbidden
        }

        const deleteRequest = new sql.Request(transaction);
        await deleteRequest
            .input('id_usuario', sql.Int, userId)
            .query(`DELETE FROM Usuario_Tela_Acesso WHERE id_usuario = @id_usuario;`);
        
        for (const tela of telasAcesso) {
            const insertRequest = new sql.Request(transaction);
            await insertRequest
                .input('id_usuario', sql.Int, userId)
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
        return NextResponse.json({ message: 'Permissões atualizadas com sucesso.' });
    }
    catch (error) {
        await transaction.rollback();
        console.error('Erro ao atualizar permissões:', error);
        return NextResponse.json({ message: 'Erro ao atualizar permissões.' }, { status: 500 });
    }
}