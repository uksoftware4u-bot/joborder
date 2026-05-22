import { autocountFetch, normalizeDebtor } from "@/lib/autocount";
import { jsonError } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await autocountFetch("/debtor/listing?activeOnly=true&field=creditTerm&field=address&field=emailAddress&page=1");
    return Response.json({
      data: (result.body?.data || result.body?.Data || []).map(normalizeDebtor),
      totalCount: result.body?.totalCount || result.body?.TotalCount || 0
    });
  } catch (error) {
    return jsonError(error.message, error.status || 500, error.body || null);
  }
}
