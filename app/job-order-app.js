"use client";

import { useEffect, useMemo, useState } from "react";

const emptyLine = {
  productCode: "",
  productName: "",
  description: "",
  qty: 1,
  unit: "",
  unitPrice: 0,
  accNo: "",
  taxCode: "",
  tariffCode: ""
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function JobOrderApp() {
  const [debtors, setDebtors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    ref: "",
    docDate: today(),
    debtorCode: "",
    debtorName: "",
    creditTerm: "",
    salesLocation: "HQ",
    notes: "",
    lines: [{ ...emptyLine }]
  });

  async function api(path, options) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
    }
    return payload;
  }

  async function loadLookups() {
    setLoading(true);
    setMessage("");
    try {
      const [debtorData, productData] = await Promise.all([
        api("/api/autocount/debtors"),
        api("/api/autocount/products", { method: "POST", body: JSON.stringify({ page: 1 }) })
      ]);
      setDebtors(debtorData.data || []);
      setProducts(productData.data || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLookups();
  }, []);

  const total = useMemo(
    () => form.lines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.unitPrice || 0), 0),
    [form.lines]
  );

  function patchForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function selectDebtor(code) {
    const debtor = debtors.find((item) => item.accNo === code || item.AccNo === code);
    patchForm({
      debtorCode: code,
      debtorName: debtor?.companyName || debtor?.CompanyName || "",
      creditTerm: debtor?.creditTerm || debtor?.CreditTerm || "C.O.D."
    });
  }

  function updateLine(index, patch) {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
    }));
  }

  function selectProduct(index, code) {
    const productView = products.find((item) => item.product?.productCode === code || item.productCode === code);
    const product = productView?.product || productView || {};
    updateLine(index, {
      productCode: code,
      productName: product.productName || "",
      description: product.productName || "",
      unit: product.unit || "",
      unitPrice: Number(product.price || 0),
      accNo: product.accNo || "",
      taxCode: product.supplyTaxCode || "",
      tariffCode: product.tariffCode || ""
    });
  }

  function addLine() {
    patchForm({ lines: [...form.lines, { ...emptyLine }] });
  }

  function removeLine(index) {
    patchForm({ lines: form.lines.filter((_, lineIndex) => lineIndex !== index) });
  }

  async function postInvoice(event) {
    event.preventDefault();
    setPosting(true);
    setMessage("");
    setResult(null);
    try {
      const response = await api("/api/autocount/post-invoice", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setResult(response.data);
      setMessage(`Posted invoice. Location: ${response.data.invoiceLocation || "(no location header returned)"}`);
      setForm({
        ref: "",
        docDate: today(),
        debtorCode: "",
        debtorName: "",
        creditTerm: "",
        salesLocation: "HQ",
        notes: "",
        lines: [{ ...emptyLine }]
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AutoCount Cloud Accounting</p>
          <h1>Job Orders</h1>
        </div>
        <button className="secondary" type="button" onClick={loadLookups} disabled={loading}>
          Refresh
        </button>
      </header>

      {message ? <div className="notice">{message}</div> : null}

      <section className="workspace">
        <form className="panel form" onSubmit={postInvoice}>
          <div className="panelHead">
            <h2>Sales Invoice Test</h2>
            <strong>RM {money(total)}</strong>
          </div>

          <div className="grid two">
            <label>
              Reference
              <input
                value={form.ref}
                onChange={(event) => patchForm({ ref: event.target.value })}
                placeholder="Auto if blank"
              />
            </label>
            <label>
              Date
              <input type="date" value={form.docDate} onChange={(event) => patchForm({ docDate: event.target.value })} />
            </label>
          </div>

          <label>
            Customer
            <select value={form.debtorCode} onChange={(event) => selectDebtor(event.target.value)} required>
              <option value="">Select existing customer</option>
              {debtors.map((debtor) => {
                const code = debtor.accNo || debtor.AccNo;
                const name = debtor.companyName || debtor.CompanyName;
                return (
                  <option key={code} value={code}>
                    {code} - {name}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="grid two">
            <label>
              Credit term
              <input value={form.creditTerm} onChange={(event) => patchForm({ creditTerm: event.target.value })} required />
            </label>
            <label>
              Sales location
              <input value={form.salesLocation} onChange={(event) => patchForm({ salesLocation: event.target.value })} required />
            </label>
          </div>

          <label>
            Notes
            <textarea value={form.notes} onChange={(event) => patchForm({ notes: event.target.value })} rows={3} />
          </label>

          <div className="lines">
            <div className="lineHeader">
              <h3>Items</h3>
              <button className="secondary" type="button" onClick={addLine}>
                Add line
              </button>
            </div>
            {form.lines.map((line, index) => (
              <div className="line" key={index}>
                <label className="productSelect">
                  Product
                  <select value={line.productCode} onChange={(event) => selectProduct(index, event.target.value)} required>
                    <option value="">Select product</option>
                    {products.map((item) => {
                      const product = item.product || item;
                      return (
                        <option key={product.productCode} value={product.productCode}>
                          {product.productCode} - {product.productName}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label>
                  Qty
                  <input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={line.qty}
                    onChange={(event) => updateLine(index, { qty: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Unit price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(event) => updateLine(index, { unitPrice: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Description
                  <input value={line.description} onChange={(event) => updateLine(index, { description: event.target.value })} required />
                </label>
                <label>
                  Unit
                  <input value={line.unit} onChange={(event) => updateLine(index, { unit: event.target.value })} />
                </label>
                <label>
                  Tax
                  <input value={line.taxCode || ""} onChange={(event) => updateLine(index, { taxCode: event.target.value })} />
                </label>
                <button className="danger" type="button" onClick={() => removeLine(index)} disabled={form.lines.length === 1}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button className="primary" type="submit" disabled={posting || loading}>
            {posting ? "Posting..." : "Post to AutoCount"}
          </button>
        </form>

        <section className="panel">
          <div className="panelHead">
            <h2>Post Result</h2>
            <span>No database</span>
          </div>
          <div className="orders">
            <p className="muted">This version only tests AutoCount API posting. It does not save job orders locally.</p>
            {result?.invoiceLocation ? (
              <a href={result.invoiceLocation} target="_blank" rel="noreferrer">
                Invoice location
              </a>
            ) : null}
            <pre>{JSON.stringify(result || { status: "Ready to post" }, null, 2)}</pre>
          </div>
        </section>
      </section>
    </main>
  );
}
