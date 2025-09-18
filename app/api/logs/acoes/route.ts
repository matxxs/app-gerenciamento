import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/config/database';
import { LogAcao } from '@/lib/types';

// GET - Listar logs de ações
export async function GET(request: NextRequest) {
  try {
    const pool = await getPool();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const acao = searchParams.get('acao');
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');

    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any = {};

    if (search) {
      whereClause += ' AND (la.acao_realizada LIKE @search OR u.nome_completo LIKE @search OR la.detalhes LIKE @search)';
      params.search = `%${search}%`;
    }

    if (acao) {
      whereClause += ' AND la.acao_realizada = @acao';
      params.acao = acao;
    }

    if (dataInicio) {
      whereClause += ' AND la.data_hora >= @data_inicio';
      params.data_inicio = new Date(dataInicio);
    }

    if (dataFim) {
      whereClause += ' AND la.data_hora <= @data_fim';
      params.data_fim = new Date(dataFim);
    }

    // Buscar logs de ações
    const logsResult = await pool.request()
      .input('search', sql.VarChar, params.search)
      .input('acao', sql.VarChar, params.acao)
      .input('data_inicio', sql.DateTime, params.data_inicio)
      .input('data_fim', sql.DateTime, params.data_fim)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT la.id_log_acao, la.id_usuario, la.acao_realizada, la.detalhes, 
               la.ip_acesso, la.data_hora, u.nome_completo as nome_usuario
        FROM Logs_Acoes la
        INNER JOIN Usuarios u ON la.id_usuario = u.id_usuario
        WHERE ${whereClause}
        ORDER BY la.data_hora DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    // Contar total
    const countResult = await pool.request()
      .input('search', sql.VarChar, params.search)
      .input('acao', sql.VarChar, params.acao)
      .input('data_inicio', sql.DateTime, params.data_inicio)
      .input('data_fim', sql.DateTime, params.data_fim)
      .query(`
        SELECT COUNT(*) as total
        FROM Logs_Acoes la
        INNER JOIN Usuarios u ON la.id_usuario = u.id_usuario
        WHERE ${whereClause}
      `);

    const total = countResult.recordset[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: logsResult.recordset,
      total,
      page,
      limit,
      totalPages
    });

  } catch (error) {
    console.error('Erro ao buscar logs de ações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
