import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/config/database';
import { EmpresaForm } from '@/lib/types';

// GET - Buscar empresa por ID
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
        SELECT id_empresa, nome_fantasia, razao_social, cnpj, data_criacao, ativo
        FROM Empresas 
        WHERE id_empresa = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar empresa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = await getPool();
    const id = parseInt(params.id);
    const body: EmpresaForm = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Validar dados obrigatórios
    if (!body.nome_fantasia || !body.razao_social || !body.cnpj) {
      return NextResponse.json(
        { error: 'Nome fantasia, razão social e CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se empresa existe
    const existingEmpresa = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id_empresa FROM Empresas WHERE id_empresa = @id');

    if (existingEmpresa.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se CNPJ já existe em outra empresa
    const existingCnpj = await pool.request()
      .input('cnpj', sql.VarChar, body.cnpj)
      .input('id', sql.Int, id)
      .query('SELECT id_empresa FROM Empresas WHERE cnpj = @cnpj AND id_empresa != @id');

    if (existingCnpj.recordset.length > 0) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado em outra empresa' },
        { status: 400 }
      );
    }

    // Verificar se razão social já existe em outra empresa
    const existingRazao = await pool.request()
      .input('razao_social', sql.VarChar, body.razao_social)
      .input('id', sql.Int, id)
      .query('SELECT id_empresa FROM Empresas WHERE razao_social = @razao_social AND id_empresa != @id');

    if (existingRazao.recordset.length > 0) {
      return NextResponse.json(
        { error: 'Razão social já cadastrada em outra empresa' },
        { status: 400 }
      );
    }

    // Atualizar empresa
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nome_fantasia', sql.VarChar, body.nome_fantasia)
      .input('razao_social', sql.VarChar, body.razao_social)
      .input('cnpj', sql.VarChar, body.cnpj)
      .input('ativo', sql.Bit, body.ativo)
      .query(`
        UPDATE Empresas 
        SET nome_fantasia = @nome_fantasia,
            razao_social = @razao_social,
            cnpj = @cnpj,
            ativo = @ativo
        OUTPUT INSERTED.*
        WHERE id_empresa = @id
      `);

    return NextResponse.json({
      data: result.recordset[0],
      message: 'Empresa atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir empresa
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

    // Verificar se empresa existe
    const existingEmpresa = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id_empresa FROM Empresas WHERE id_empresa = @id');

    if (existingEmpresa.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há filiais vinculadas
    const filiaisVinculadas = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) as total FROM Filiais WHERE id_empresa = @id');

    if (filiaisVinculadas.recordset[0].total > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir empresa com filiais vinculadas' },
        { status: 400 }
      );
    }

    // Verificar se há usuários vinculados
    const usuariosVinculados = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) as total FROM Usuarios WHERE id_empresa = @id');

    if (usuariosVinculados.recordset[0].total > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir empresa com usuários vinculados' },
        { status: 400 }
      );
    }

    // Excluir empresa
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Empresas WHERE id_empresa = @id');

    return NextResponse.json({
      message: 'Empresa excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
