import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch Users
    const { data: users } = await supabaseAdmin.from('profiles').select('*');

    // 2. Fetch Escrow Holds
    const { data: escrows } = await supabaseAdmin.from('escrow_holds').select('amount, status');
    
    let totalLocked = 0;
    let totalReleased = 0;
    
    if (escrows) {
      escrows.forEach(e => {
        if (e.status === 'pending' || e.status === 'disputed') {
          totalLocked += Number(e.amount);
        } else if (e.status === 'released') {
          totalReleased += Number(e.amount);
        }
      });
    }

    const platformEscrowVolume = totalLocked + totalReleased;
    const revenueCut = platformEscrowVolume * 0.10;

    // 3. Fetch Disputes
    const { data: disputes } = await supabaseAdmin
      .from('disputes')
      .select('*, initiator:initiator_id(id, raw_user_meta_data), target:target_id(id, raw_user_meta_data)')
      .eq('status', 'open');

    return NextResponse.json({
      users: users || [],
      financials: {
        platformEscrowVolume,
        revenueCut,
        totalLocked
      },
      disputes: disputes || []
    });
  } catch (error: any) {
    console.error("Admin Dashboard Error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
