import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/config/database';
import { Filial, FilialForm } from '@/lib/types';

// GET - Listar todas as filiais
export async function GET(request: NextRequest) {
  try {
    const pool = await getPool();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const ativo = searchParams.get('ativo');
    const id_empresa = searchParams.get('id_empresa');

    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any = {};

    if (search) {
      whereClause += ' AND (f.nome_filial LIKE @search OR f.cidade LIKE @search OR f.estado LIKE @search)';
      params.search = `%${search}%`;
    }

    if (ativo !== null && ativo !== undefined) {
      whereClause += ' AND f.ativo = @ativo';
      params.ativo = ativo === 'true';
    }

    if (id_empresa) {
      whereClause += ' AND f.id_empresa = @id_empresa';
      params.id_empresa = parseInt(id_empresa);
    }

    // Buscar filiais com dados da empresa
    const filiaisResult = await pool.request()
      .input('search', sql.VarChar, params.search)
      .input('ativo', sql.Bit, params.ativo)
      .input('id_empresa', sql.Int, params.id_empresa)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT f.id_filial, f.id_empresa, f.nome_filial, f.endereco, f.cidade, f.estado, 
               f.data_criacao, f.ativo, e.nome_fantasia as nome_empresa
        FROM Filiais f
        INNER JOIN Empresas e ON f.id_empresa = e.id_empresa
        WHERE ${whereClause}
        ORDER BY f.nome_filial
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool.request()
      .input('search', sql.VarChar, params.search)
      .input('ativo', sql.Bit, params.ativo)
      .input('id_empresa', sql.Int, params.id_empresa)
      .query(`
        SELECT COUNT(*) as total
        FROM Filiais f
        INNER JOIN Empresas e ON f.id_empresa = e.id_empresa
        WHERE ${whereClause}
      `);

    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: filiaisResult.recordset,
      total,
      page,
      limit,
      totalPages
    });

  } catch (error) {
    console.error('Erro ao buscar filiais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova filial
export async function POST(request: NextRequest) {
  try {
    const body: FilialForm = await request.json();
    const pool = await getPool();

    if (!body.nome_filial || !body.id_empresa) {
      return NextResponse.json(
        { error: 'Nome da filial e empresa são obrigatórios' },
        { status: 400 }
      );
    }

    const empresaExiste = await pool.request()
      .input('id_empresa', sql.Int, body.id_empresa)
      .query('SELECT id_empresa FROM Empresas WHERE id_empresa = @id_empresa AND ativo = 1');

    if (empresaExiste.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Empresa não encontrada ou inativa' },
        { status: 400 }
      );
    }

    const filialExiste = await pool.request()
      .input('nome_filial', sql.VarChar, body.nome_filial)
      .input('id_empresa', sql.Int, body.id_empresa)
      .query('SELECT id_filial FROM Filiais WHERE nome_filial = @nome_filial AND id_empresa = @id_empresa');

    if (filialExiste.recordset.length > 0) {
      return NextResponse.json(
        { error: 'Já existe uma filial com este nome nesta empresa' },
        { status: 400 }
      );
    }

    // Inserir nova filial
    const result = await pool.request()
      .input('id_empresa', sql.Int, body.id_empresa)
      .input('nome_filial', sql.VarChar, body.nome_filial)
      .input('endereco', sql.VarChar, body.endereco || null)
      .input('cidade', sql.VarChar, body.cidade || null)
      .input('estado', sql.VarChar, body.estado || null)
      .input('ativo', sql.Bit, body.ativo)
      .query(`
        INSERT INTO Filiais (id_empresa, nome_filial, endereco, cidade, estado, ativo)
        OUTPUT INSERTED.*
        VALUES (@id_empresa, @nome_filial, @endereco, @cidade, @estado, @ativo)
      `);

    return NextResponse.json({
      data: result.recordset[0],
      message: 'Filial criada com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar filial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
