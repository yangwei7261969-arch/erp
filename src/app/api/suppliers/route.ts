import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取供应商列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');

    const client = getSupabaseClient();
    
    let query = client
      .from('suppliers')
      .select('*', { count: 'exact' })
      .eq('is_active', true);
    
    // 状态筛选
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      total: count,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

// 创建供应商
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 生成供应商编码
    const { data: existing } = await client
      .from('suppliers')
      .select('code')
      .order('code', { ascending: false })
      .limit(1);

    let newCode = 'S001';
    if (existing && existing.length > 0) {
      const lastCode = existing[0].code;
      const num = parseInt(lastCode.replace(/\D/g, '')) + 1;
      newCode = `S${String(num).padStart(3, '0')}`;
    }

    const { data, error } = await client
      .from('suppliers')
      .insert({
        code: newCode,
        name: body.name,
        short_name: body.short_name || null,
        type: body.type || null,
        category: body.category || null,
        supplier_level: body.supplier_level || 1,
        contact: body.contact,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        tax_no: body.tax_no || null,
        bank_name: body.bank_name || null,
        bank_account: body.bank_account || null,
        bank_branch: body.bank_branch || null,
        account_name: body.account_name || null,
        payment_terms: body.payment_terms || null,
        credit_limit: body.credit_limit || null,
        balance: 0,
        rating: body.rating || 5,
        notes: body.notes || null,
        is_active: true,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// 更新供应商
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { error } = await client
      .from('suppliers')
      .update({
        name: body.name,
        short_name: body.short_name || null,
        type: body.type || null,
        category: body.category || null,
        supplier_level: body.supplier_level || 1,
        contact: body.contact,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        tax_no: body.tax_no || null,
        bank_name: body.bank_name || null,
        bank_account: body.bank_account || null,
        bank_branch: body.bank_branch || null,
        account_name: body.account_name || null,
        payment_terms: body.payment_terms || null,
        credit_limit: body.credit_limit || null,
        rating: body.rating || 5,
        notes: body.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update supplier error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// 删除供应商（软删除）
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { error } = await client
      .from('suppliers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
