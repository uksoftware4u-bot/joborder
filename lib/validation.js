export function validateJobOrder(input) {
  const errors = [];
  if (!input || typeof input !== "object") errors.push("Request body is required.");
  if (!input?.docDate) errors.push("Document date is required.");
  if (!input?.debtorCode) errors.push("Customer is required.");
  if (!input?.debtorName) errors.push("Customer name is required.");
  if (!input?.creditTerm) errors.push("Credit term is required.");
  if (!input?.salesLocation) errors.push("Sales location is required.");
  if (!Array.isArray(input?.lines) || input.lines.length === 0) errors.push("At least one item line is required.");

  input?.lines?.forEach((line, index) => {
    const label = `Line ${index + 1}`;
    if (!line.productCode) errors.push(`${label}: product is required.`);
    if (!line.description) errors.push(`${label}: description is required.`);
    if (!(Number(line.qty) > 0)) errors.push(`${label}: qty must be greater than zero.`);
    if (!(Number(line.unitPrice) >= 0)) errors.push(`${label}: unit price must be zero or greater.`);
  });

  return errors;
}

export function jsonError(message, status = 400, details = null) {
  return Response.json({ error: message, details }, { status });
}
