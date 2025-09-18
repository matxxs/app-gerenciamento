import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/config/database';
import { Empresa, EmpresaForm } from '@/lib/types';

// GET - Listar todas as empresas
export async function GET(request: NextRequest) {
  try {
    const pool = await getPool();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const ativo = searchParams.get('ativo');

    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any = {};

    if (search) {
      whereClause += ' AND (nome_fantasia LIKE @search OR razao_social LIKE @search OR cnpj LIKE @search)';
      params.search = `%${search}%`;
    }

    if (ativo !== null && ativo !== undefined) {
      whereClause += ' AND ativo = @ativo';
      params.ativo = ativo === 'true';
    }

    // Buscar empresas
    const empresasResult = await pool.request()
      .input('search', sql.VarChar, params.search)
      .input('ativo', sql.Bit, params.ativo)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT id_empresa, nome_fantasia, razao_social, cnpj, data_criacao, ativo
        FROM Empresas 
        WHERE ${whereClause}
        ORDER BY nome_fantasia
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    // Contar total
    const countResult = await pool.request()
      .input('search', sql.VarChar, params.search)
      .input('ativo', sql.Bit, params.ativo)
      .query(`
        SELECT COUNT(*) as total
        FROM Empresas 
        WHERE ${whereClause}
      `);

    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: empresasResult.recordset,
      total,
      page,
      limit,
      totalPages
    });

  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    const body: EmpresaForm = await request.json();
    const pool = await getPool();

    // Validar dados obrigatórios
    if (!body.nome_fantasia || !body.razao_social || !body.cnpj) {
      return NextResponse.json(
        { error: 'Nome fantasia, razão social e CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe
    const existingCnpj = await pool.request()
      .input('cnpj', sql.VarChar, body.cnpj)
      .query('SELECT id_empresa FROM Empresas WHERE cnpj = @cnpj');

    if (existingCnpj.recordset.length > 0) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se razão social já existe
    const existingRazao = await pool.request()
      .input('razao_social', sql.VarChar, body.razao_social)
      .query('SELECT id_empresa FROM Empresas WHERE razao_social = @razao_social');

    if (existingRazao.recordset.length > 0) {
      return NextResponse.json(
        { error: 'Razão social já cadastrada' },
        { status: 400 }
      );
    }

    // Inserir nova empresa
    const result = await pool.request()
      .input('nome_fantasia', sql.VarChar, body.nome_fantasia)
      .input('razao_social', sql.VarChar, body.razao_social)
      .input('cnpj', sql.VarChar, body.cnpj)
      .input('ativo', sql.Bit, body.ativo)
      .query(`
        INSERT INTO Empresas (nome_fantasia, razao_social, cnpj, ativo)
        OUTPUT INSERTED.*
        VALUES (@nome_fantasia, @razao_social, @cnpj, @ativo)
      `);

    return NextResponse.json({
      data: result.recordset[0],
      message: 'Empresa criada com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
