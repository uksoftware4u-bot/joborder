import { autocountFetch, normalizeProduct } from "@/lib/autocount";
import { jsonError } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const input = await request.json().catch(() => ({}));
    const body = {
      page: Number(input.page || 1),
      ...(input.filter ? { filter: input.filter } : {})
    };
    const result = await autocountFetch("/product/listing", {
      method: "POST",
      body: JSON.stringify(body)
    });
    return Response.json({
      data: (result.body?.data || result.body?.Data || []).map(normalizeProduct),
      totalCount: result.body?.totalCount || result.body?.TotalCount || 0
    });
  } catch (error) {
    return jsonError(error.message, error.status || 500, error.body || null);
  }
}
