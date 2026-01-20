import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdminClient } from "@/lib/supabase";

type OrderItem = {
  toyId: string;
  toyName: string;
  colors: string[];
};

type OrderRequest = {
  items: OrderItem[];
  buyerName: string;
  buyerContact: string;
  total: number;
  notes?: string;
};

// Lazy initialization to avoid build-time errors
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const MATT_EMAIL = process.env.MATT_EMAIL || "grossi16n@hotmail.com";
const MATT_PHONE = process.env.MATT_PHONE || "";

export async function POST(request: Request) {
  try {
    const order: OrderRequest = await request.json();

    if (!order.items?.length || !order.buyerName || !order.buyerContact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Save order to database
    const supabase = getSupabaseAdminClient();
    const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const { error: dbError } = await supabase.from("orders").insert({
      id: orderId,
      buyer_name: order.buyerName,
      buyer_contact: order.buyerContact,
      items: order.items,
      total: order.total,
      notes: order.notes || null,
      is_completed: false,
      is_paid: false,
    });

    if (dbError) {
      console.error("Database error saving order:", dbError);
      // Continue anyway - still send email
    } else {
      console.log(`✅ Order saved to database: ${orderId}`);
    }

    // Log the order
    console.log("\n🌈 ========================================");
    console.log("🧸 NEW RAINBOW TOYS ORDER!");
    console.log("========================================");
    console.log(`Order ID: ${orderId}`);
    console.log(`Customer: ${order.buyerName}`);
    console.log(`Contact: ${order.buyerContact}`);
    console.log(`Total: $${order.total}`);
    console.log("Items:");
    order.items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.toyName} (${item.colors.join(", ")})`);
    });
    console.log(`Time: ${timestamp}`);
    console.log("========================================\n");

    // Send email
    if (process.env.RESEND_API_KEY) {
      const resend = getResend();
      const itemsList = order.items
        .map((item) => `<li><strong>${item.toyName}</strong> — ${item.colors.join(", ")}</li>`)
        .join("");

      const { error } = await resend.emails.send({
        from: "Rainbow Toys <onboarding@resend.dev>",
        to: MATT_EMAIL,
        subject: `🧸 New Order: ${order.items.length} toy${order.items.length > 1 ? "s" : ""} ($${order.total})`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:linear-gradient(180deg,#e0f2fe,#fce7f3);min-height:100vh;">
  <div style="max-width:500px;margin:0 auto;padding:32px 16px;">
    
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;">🌈</div>
      <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#1e293b;">New Order!</h1>
    </div>

    <div style="background:white;border-radius:24px;padding:24px;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
      
      <div style="text-align:center;padding-bottom:20px;border-bottom:2px dashed #f0abfc;">
        <div style="font-size:36px;font-weight:800;color:#ec4899;">$${order.total}</div>
        <div style="color:#64748b;font-weight:600;">${order.items.length} toy${order.items.length > 1 ? "s" : ""}</div>
      </div>

      <div style="padding:20px 0;border-bottom:2px dashed #f0abfc;">
        <div style="font-size:12px;font-weight:700;color:#a855f7;text-transform:uppercase;margin-bottom:12px;">🧸 Toys Ordered</div>
        <ul style="margin:0;padding-left:20px;color:#1e293b;font-weight:600;">
          ${itemsList}
        </ul>
      </div>

      <div style="padding:20px 0;">
        <div style="font-size:12px;font-weight:700;color:#a855f7;text-transform:uppercase;margin-bottom:12px;">👤 Customer</div>
        <div style="font-size:18px;font-weight:700;color:#1e293b;">${order.buyerName}</div>
        <a href="${order.buyerContact.includes("@") ? `mailto:${order.buyerContact}` : `tel:${order.buyerContact}`}" 
           style="color:#ec4899;font-weight:600;text-decoration:none;">
          ${order.buyerContact}
        </a>
      </div>

      <div style="text-align:center;padding-top:16px;color:#94a3b8;font-size:12px;">
        ⏰ ${timestamp}
      </div>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <a href="${order.buyerContact.includes("@") ? `mailto:${order.buyerContact}?subject=Your Rainbow Toys Order` : `sms:${order.buyerContact}`}" 
         style="display:inline-block;background:linear-gradient(90deg,#ec4899,#be185d);color:white;padding:14px 28px;border-radius:100px;font-weight:800;text-decoration:none;">
        Reply to ${order.buyerName} 💌
      </a>
    </div>

  </div>
</body>
</html>
        `,
      });

      if (error) {
        console.error("Email error:", error);
      } else {
        console.log("✅ Email sent to Matt!");
      }
    }

    return NextResponse.json({ success: true, mattPhone: MATT_PHONE });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
