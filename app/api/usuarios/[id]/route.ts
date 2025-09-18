import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database';
import { Usuario, UsuarioTelaAcesso } from "@/lib/types";

type UsuarioComAcesso = Omit<Usuario, 'senha_hash'> & {
    telasAcesso: UsuarioTelaAcesso[];
};

export async function GET(request: NextRequest, context: { params: { id: string } }) {
    const userId = parseInt(context.params.id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }

    try {
        const pool = await getPool();
    
        const userResult = await pool.request()
            .input('id_usuario', sql.Int, userId)
            .query<Usuario & { nome_funcao: string }>(`
                SELECT 
                    u.id_usuario, u.id_empresa, u.id_funcao, u.nome_completo, u.email, u.ativo,
                    f.nome_funcao
                FROM Usuarios u
                JOIN Funcoes f ON u.id_funcao = f.id_funcao
                WHERE u.id_usuario = @id_usuario;
            `);
            
        if (userResult.recordset.length === 0) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }
        const usuario = userResult.recordset[0];

        let telasAcesso: UsuarioTelaAcesso[];

        if (usuario.nome_funcao === 'Administrador de Sistema') {
            const adminTelasResult = await pool.request().query<UsuarioTelaAcesso>(`
                SELECT 
                    id_tela,
                    CONVERT(BIT, 1) as pode_criar,
                    CONVERT(BIT, 1) as pode_ler,
                    CONVERT(BIT, 1) as pode_atualizar,
                    CONVERT(BIT, 1) as pode_deletar
                FROM Telas WHERE ativo = 1;
            `);
            telasAcesso = adminTelasResult.recordset;
        } else {
            const telasResult = await pool.request()
                .input('id_usuario', sql.Int, usuario.id_usuario)
                .input('id_funcao', sql.Int, usuario.id_funcao)
                .query<UsuarioTelaAcesso>(`
                    SELECT
                        t.id_tela,
                        CONVERT(BIT, COALESCE(up.pode_criar, rp.pode_criar, 0)) as pode_criar,
                        CONVERT(BIT, COALESCE(up.pode_ler, rp.pode_ler, 0)) as pode_ler,
                        CONVERT(BIT, COALESCE(up.pode_atualizar, rp.pode_atualizar, 0)) as pode_atualizar,
                        CONVERT(BIT, COALESCE(up.pode_deletar, rp.pode_deletar, 0)) as pode_deletar
                    FROM Telas t
                    LEFT JOIN Funcao_Tela_Acesso rp ON t.id_tela = rp.id_tela AND rp.id_funcao = @id_funcao
                    LEFT JOIN Usuario_Tela_Acesso up ON t.id_tela = up.id_tela AND up.id_usuario = @id_usuario
                    WHERE t.ativo = 1;
                `);
            telasAcesso = telasResult.recordset;
        }

        const responseData: UsuarioComAcesso = { ...usuario, telasAcesso };
        return NextResponse.json({ data: responseData });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return NextResponse.json({ message: 'Erro ao buscar usuário.' }, { status: 500 });
    }  
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
    const userId = parseInt(context.params.id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }

    const { id_empresa, nome_completo, email, ativo, id_funcao }: Partial<Usuario & { id_empresa: number }> = await request.json();

    if (!id_empresa || !nome_completo || !email || ativo === undefined || !id_funcao) {
        return NextResponse.json({ message: 'Todos os campos, incluindo id_empresa, são obrigatórios.' }, { status: 400 });
    }

    try {
        const pool = await getPool();
        const updateResult = await pool.request()
            .input('id_usuario', sql.Int, userId)
            .input('id_empresa', sql.Int, id_empresa)
            .input('nome_completo', sql.VarChar, nome_completo)
            .input('email', sql.VarChar, email)
            .input('ativo', sql.Bit, ativo)
            .input('id_funcao', sql.Int, id_funcao)
            .query(`
                UPDATE Usuarios 
                SET nome_completo = @nome_completo, email = @email, ativo = @ativo, id_funcao = @id_funcao
                WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa;
            `);

        if (updateResult.rowsAffected[0] === 0) {
            return NextResponse.json({ message: 'Usuário não encontrado ou não pertence a esta empresa.' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Usuário atualizado com sucesso.' });

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        return NextResponse.json({ message: 'Erro ao atualizar usuário.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    const userId = parseInt(context.params.id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'ID de usuário inválido.' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const idEmpresa = searchParams.get('id_empresa');

    if (!idEmpresa) {
        return NextResponse.json({ message: 'O parâmetro de URL "id_empresa" é obrigatório.' }, { status: 400 });
    }
    const empresaId = parseInt(idEmpresa, 10);
    if (isNaN(empresaId)) {
        return NextResponse.json({ message: 'O valor de "id_empresa" é inválido.' }, { status: 400 });
    }

    try {
        const pool = await getPool();
        const deleteResult = await pool.request()
            .input('id_usuario', sql.Int, userId)
            .input('id_empresa', sql.Int, empresaId)
            .query(`DELETE FROM Usuarios WHERE id_usuario = @id_usuario AND id_empresa = @id_empresa;`);
            
        if (deleteResult.rowsAffected[0] === 0) {
            return NextResponse.json({ message: 'Usuário não encontrado ou não pertence a esta empresa.' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Usuário deletado com sucesso.' });

    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        return NextResponse.json({ message: 'Erro ao deletar usuário.' }, { status: 500 });
    }
}