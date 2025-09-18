import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/config/database';
import { FilialForm } from '@/lib/types';

// GET - Buscar filial por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = await getPool();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT f.id_filial, f.id_empresa, f.nome_filial, f.endereco, f.cidade, f.estado, 
               f.data_criacao, f.ativo, e.nome_fantasia as nome_empresa
        FROM Filiais f
        INNER JOIN Empresas e ON f.id_empresa = e.id_empresa
        WHERE f.id_filial = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Filial não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Erro ao buscar filial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar filial
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = await getPool();
    const id = parseInt(params.id);
    const body: FilialForm = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Validar dados obrigatórios
    if (!body.nome_filial || !body.id_empresa) {
      return NextResponse.json(
        { error: 'Nome da filial e empresa são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se filial existe
    const existingFilial = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id_filial FROM Filiais WHERE id_filial = @id');

    if (existingFilial.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Filial não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se empresa existe
    const empresaExiste = await pool.request()
      .input('id_empresa', sql.Int, body.id_empresa)
      .query('SELECT id_empresa FROM Empresas WHERE id_empresa = @id_empresa AND ativo = 1');

    if (empresaExiste.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Empresa não encontrada ou inativa' },
        { status: 400 }
      );
    }

    // Verificar se já existe filial com o mesmo nome na empresa (exceto a atual)
    const filialExiste = await pool.request()
      .input('nome_filial', sql.VarChar, body.nome_filial)
      .input('id_empresa', sql.Int, body.id_empresa)
      .input('id', sql.Int, id)
      .query('SELECT id_filial FROM Filiais WHERE nome_filial = @nome_filial AND id_empresa = @id_empresa AND id_filial != @id');

    if (filialExiste.recordset.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma filial com este nome nesta empresa' },
        { status: 400 }
      );
    }

    // Atualizar filial
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('id_empresa', sql.Int, body.id_empresa)
      .input('nome_filial', sql.VarChar, body.nome_filial)
      .input('endereco', sql.VarChar, body.endereco || null)
      .input('cidade', sql.VarChar, body.cidade || null)
      .input('estado', sql.VarChar, body.estado || null)
      .input('ativo', sql.Bit, body.ativo)
      .query(`
        UPDATE Filiais 
        SET id_empresa = @id_empresa,
            nome_filial = @nome_filial,
            endereco = @endereco,
            cidade = @cidade,
            estado = @estado,
            ativo = @ativo
        OUTPUT INSERTED.*
        WHERE id_filial = @id
      `);

    return NextResponse.json({
      data: result.recordset[0],
      message: 'Filial atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir filial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = await getPool();
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se filial existe
    const existingFilial = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id_filial FROM Filiais WHERE id_filial = @id');

    if (existingFilial.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Filial não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há usuários vinculados a esta filial
    const usuariosVinculados = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) as total FROM Usuario_Filial_Acesso WHERE id_filial = @id');

    if (usuariosVinculados.recordset[0].total > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir filial com usuários vinculados' },
        { status: 400 }
      );
    }

    // Excluir filial
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Filiais WHERE id_filial = @id');

    return NextResponse.json({
      message: 'Filial excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir filial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
