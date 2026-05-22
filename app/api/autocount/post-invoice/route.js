import { autocountFetch, getAutoCountConfig } from "@/lib/autocount";
import { jsonError, validateJobOrder } from "@/lib/validation";

export const runtime = "nodejs";

function buildInvoicePayload(input) {
  const config = getAutoCountConfig();
  const ref = input.ref?.trim() || `API-TEST-${Date.now()}`;

  return {
    master: {
      docDate: input.docDate,
      debtorCode: input.debtorCode,
      debtorName: input.debtorName,
      creditTerm: input.creditTerm,
      salesLocation: input.salesLocation || config.salesLocation,
      currencyRate: 1,
      inclusiveTax: false,
      isRoundAdj: false,
      ref,
      description: `API test invoice ${ref}`,
      note: input.notes || ""
    },
    details: input.lines.map((line) => ({
      productCode: line.productCode,
      accNo: line.accNo || config.salesAccNo,
      description: line.description,
      qty: Number(line.qty),
      unit: line.unit || null,
      unitPrice: Number(line.unitPrice),
      taxCode: line.taxCode || null,
      tariffCode: line.tariffCode || null,
      localTotalCost: 0
    })),
    autoFillOption: {
      accNo: false,
      taxCode: false,
      tariffCode: false,
      localTotalCost: true
    },
    saveApprove: false
  };
}

export async function POST(request) {
  try {
    const input = await request.json();
    const errors = validateJobOrder(input);
    if (errors.length) return jsonError("Invoice test input is invalid.", 400, errors);

    const result = await autocountFetch("/invoice", {
      method: "POST",
      body: JSON.stringify(buildInvoicePayload(input))
    });

    return Response.json({
      data: {
        status: result.status,
        invoiceLocation: result.headers.get("location") || "",
        response: result.body
      }
    });
  } catch (error) {
    return jsonError(error.message, error.status || 500, error.body || null);
  }
}
