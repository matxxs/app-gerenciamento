import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/config/database'; 
import { UsuarioLista } from "@/lib/types";


export async function GET(request: NextRequest) {
  try {
    const pool = await getPool();

    const result = await pool.request()
      .query<UsuarioLista>(`
        SELECT 
          u.id_usuario, 
          u.nome_completo, 
          u.email, 
          u.ativo,
          f.nome_funcao
        FROM Usuarios u
        JOIN Funcoes f ON u.id_funcao = f.id_funcao
        ORDER BY u.nome_completo;
      `);

    return NextResponse.json({ data: result.recordset });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
  }
}