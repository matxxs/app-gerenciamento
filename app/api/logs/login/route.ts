import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/config/database';
import { LogLogin } from '@/lib/types';

// GET - Listar logs de login
export async function GET(request: NextRequest) {
  try {
    const pool = await getPool();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sucesso = searchParams.get('sucesso');
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');

    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: any = {};

    if (search) {
      whereClause += ' AND (ll.email_tentativa LIKE @search OR u.nome_completo LIKE @search)';
      params.search = `%${search}%`;
    }

    if (sucesso !== null && sucesso !== undefined) {
      whereClause += ' AND ll.sucesso = @sucesso';
      params.sucesso = sucesso === 'true';
    }

    if (dataInicio) {
      whereClause += ' AND ll.data_hora >= @data_inicio';
      params.data_inicio = new Date(dataInicio);
    }

    if (dataFim) {
      whereClause += ' AND ll.data_hora <= @data_fim';
      params.data_fim = new Date(dataFim);
    }

    // Buscar logs de login
    const logsResult = await pool.request()
      .input('search', sql.VarChar, params.search)
      .input('sucesso', sql.Bit, params.sucesso)
      .input('data_inicio', sql.DateTime, params.data_inicio)
      .input('data_fim', sql.DateTime, params.data_fim)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT ll.id_log_login, ll.id_usuario, ll.email_tentativa, ll.ip_acesso, 
               ll.data_hora, ll.sucesso, ll.user_agent, u.nome_completo as nome_usuario
        FROM Logs_Login ll
        LEFT JOIN Usuarios u ON ll.id_usuario = u.id_usuario
        WHERE ${whereClause}
        ORDER BY ll.data_hora DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    // Contar total
    const countResult = await pool.request()
      .input('search', sql.VarChar, params.search)
      .input('sucesso', sql.Bit, params.sucesso)
      .input('data_inicio', sql.DateTime, params.data_inicio)
      .input('data_fim', sql.DateTime, params.data_fim)
      .query(`
        SELECT COUNT(*) as total
        FROM Logs_Login ll
        LEFT JOIN Usuarios u ON ll.id_usuario = u.id_usuario
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
    console.error('Erro ao buscar logs de login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
