// app/api/funcoes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from '@/config/database';
import { Funcao } from "@/lib/types";

// GET para listar todas as funções
export async function GET(request: NextRequest) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query<Funcao>(`
        SELECT 
          id_funcao, nome_funcao, descricao, pode_ver_todas_filiais
        FROM Funcoes
      `);
    const funcoes = result.recordset;
    return NextResponse.json({ data: funcoes });
  } catch (error) {
    console.error('Erro ao buscar funcoes:', error);
    return NextResponse.json({ message: 'Erro ao buscar funcoes.' }, { status: 500 });
  }
}

// POST para CRIAR uma nova função
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome_funcao, descricao, pode_ver_todas_filiais, permissoes } = body;

    if (!nome_funcao) {
      return NextResponse.json({ message: 'O campo "nome_funcao" é obrigatório.' }, { status: 400 });
    }

    const pool = await getPool();
    const transaction = pool.transaction();

    await transaction.begin();

    try {
        const resultFuncao = await transaction.request()
            .input('nome_funcao', sql.VarChar, nome_funcao)
            .input('descricao', sql.VarChar, descricao || null)
            .input('pode_ver_todas_filiais', sql.Bit, pode_ver_todas_filiais)
            .query(`
                INSERT INTO Funcoes (nome_funcao, descricao, pode_ver_todas_filiais)
                OUTPUT INSERTED.id_funcao
                VALUES (@nome_funcao, @descricao, @pode_ver_todas_filiais)
            `);
        
        const newFuncaoId = resultFuncao.recordset[0].id_funcao;

        if (permissoes && permissoes.length > 0) {
            const table = new sql.Table('Funcao_Tela_Acesso');
            table.columns.add('id_funcao', sql.Int);
            table.columns.add('id_tela', sql.Int);
            table.columns.add('pode_criar', sql.Bit);
            table.columns.add('pode_ler', sql.Bit);
            table.columns.add('pode_atualizar', sql.Bit);
            table.columns.add('pode_deletar', sql.Bit);

            for (const p of permissoes) {
                table.rows.add(newFuncaoId, p.id_tela, p.pode_criar, p.pode_ler, p.pode_atualizar, p.pode_deletar);
            }
            
            await transaction.request().bulk(table);
        }

        await transaction.commit();
        return NextResponse.json({ message: 'Função criada com sucesso!', id: newFuncaoId }, { status: 201 });
        
    } catch (error) {
        await transaction.rollback();
        throw error; 
    }

  } catch (error) {
    console.error('Erro ao criar função:', error);
    return NextResponse.json({ message: 'Erro ao criar função.' }, { status: 500 });
  }
}