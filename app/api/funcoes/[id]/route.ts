// /app/api/funcoes/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getPool, sql } from '@/config/database';

// GET para buscar uma função específica com suas permissões
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10); // É bom garantir que o ID seja um número
    const pool = await getPool();

    const funcaoPromise = pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Funcoes WHERE id_funcao = @id');
    
    const permissoesPromise = pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT id_tela, pode_criar, pode_ler, pode_atualizar, pode_deletar 
        FROM Funcao_Tela_Acesso WHERE id_funcao = @id
      `);

    const [funcaoResult, permissoesResult] = await Promise.all([funcaoPromise, permissoesPromise]);

    if (funcaoResult.recordset.length === 0) {
      return NextResponse.json({ message: 'Função não encontrada.' }, { status: 404 });
    }

    // Retorna um objeto que corresponde à interface FuncaoDetalhada
    return NextResponse.json({
      ...funcaoResult.recordset[0],
      permissoes: permissoesResult.recordset
    });

  } catch (error) {
    console.error('Erro ao buscar função:', error);
    return NextResponse.json({ message: 'Erro ao buscar função.' }, { status: 500 });
  }
}

// PUT para atualizar uma função e suas permissões
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { nome_funcao, descricao, pode_ver_todas_filiais, permissoes } = body;
  const id = parseInt(params.id, 10); // AJUSTE: Converter o ID para número

  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });
  }

  const pool = await getPool();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // 1. Atualiza os dados da tabela Funcoes
    await transaction.request()
      .input('id', sql.Int, id)
      .input('nome_funcao', sql.VarChar, nome_funcao)
      .input('descricao', sql.VarChar, descricao || null) // Permite descrição nula
      .input('pode_ver_todas_filiais', sql.Bit, pode_ver_todas_filiais)
      .query(`
        UPDATE Funcoes 
        SET nome_funcao = @nome_funcao, 
            descricao = @descricao, 
            pode_ver_todas_filiais = @pode_ver_todas_filiais 
        WHERE id_funcao = @id
      `);

    // 2. Deleta as permissões antigas
    await transaction.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Funcao_Tela_Acesso WHERE id_funcao = @id');
    
    // 3. Insere as novas permissões em lote (se existirem)
    if (permissoes && permissoes.length > 0) {
      const table = new sql.Table('Funcao_Tela_Acesso');
      table.columns.add('id_funcao', sql.Int);
      table.columns.add('id_tela', sql.Int);
      table.columns.add('pode_criar', sql.Bit);
      table.columns.add('pode_ler', sql.Bit);
      table.columns.add('pode_atualizar', sql.Bit);
      table.columns.add('pode_deletar', sql.Bit);

      for (const p of permissoes) {
        // AJUSTE: Usar a variável 'id' convertida
        table.rows.add(id, p.id_tela, p.pode_criar, p.pode_ler, p.pode_atualizar, p.pode_deletar);
      }
      
      await transaction.request().bulk(table);
    }

    await transaction.commit();
    return NextResponse.json({ message: 'Função atualizada com sucesso!' });

  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar função:', error);
    return NextResponse.json({ message: 'Erro ao atualizar função.' }, { status: 500 });
  }
}

// DELETE para remover uma função
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });
    }

    const pool = await getPool();
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Funcao_Tela_Acesso WHERE id_funcao = @id');
        
        const result = await transaction.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Funcoes WHERE id_funcao = @id');

        await transaction.commit();
        
        if (result.rowsAffected[0] === 0) {
            return NextResponse.json({ message: 'Função não encontrada.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Função deletada com sucesso!' });
    } catch (error) {
        await transaction.rollback();
        console.error('Erro ao deletar função:', error);
        return NextResponse.json({ message: 'Erro ao deletar função.' }, { status: 500 });
    }
}