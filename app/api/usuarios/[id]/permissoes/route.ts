import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database';
import { Usuario_Tela_Acesso } from "../route";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
        return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }

    const body = await request.json();
    const telasAcesso: Usuario_Tela_Acesso[] = body.telasAcesso;

    if (!Array.isArray(telasAcesso)) {
        return NextResponse.json({ message: 'Formato de dados inválido.' }, { status: 400 });
    }

    try {
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        const dbRequest = new sql.Request(transaction);

        await dbRequest
            .input('id_usuario', sql.Int, userId)
            .query(`
                DELETE FROM Usuario_Tela_Acesso WHERE id_usuario = @id_usuario;
            `);
        
        for (const tela of telasAcesso) {
            dbRequest.parameters = {}; 
            await dbRequest
                .input('id_usuario', sql.Int, userId)
                .input('id_tela', sql.Int, tela.id_tela)
                .input('pode_criar', sql.Bit, tela.pode_criar)
                .input('pode_ler', sql.Bit, tela.pode_ler)
                .input('pode_atualizar', sql.Bit, tela.pode_atualizar)
                .input('pode_deletar', sql.Bit, tela.pode_deletar)
                .query(`
                    INSERT INTO Usuario_Tela_Acesso 
                    (id_usuario, id_tela, pode_criar, pode_ler, pode_atualizar, pode_deletar)  
                    VALUES
                    (@id_usuario, @id_tela, @pode_criar, @pode_ler, @pode_atualizar, @pode_deletar);
                `);
        }

        await transaction.commit();
        return NextResponse.json({ message: 'Permissões atualizadas com sucesso.' });
    }
    catch (error) {
        console.error('Erro ao atualizar permissões:', error);
        return NextResponse.json({ message: 'Erro ao atualizar permissões.' }, { status: 500 });
    }
}