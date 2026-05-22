# AutoCount Cloud Accounting API Test Website

This is a no-database test website for verifying AutoCount Cloud Accounting API integration.

It lets a tester:

- Load debtor options from AutoCount.
- Load product/item options from AutoCount.
- Fill a simple Sales Invoice test form.
- Post directly to AutoCount `POST /{accountBookId}/invoice`.

The app does not save job orders locally.

## Local Run

```powershell
cd C:\Users\Dell\Documents\Codex\2026-05-22\https-accounting-api-autocountcloud-com-swagger
cmd /c "C:\Program Files\nodejs\npm.cmd" run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Create `.env.local` locally, or add the same variables in Vercel:

```text
AUTOCOUNT_ACCOUNT_BOOK_ID=1
AUTOCOUNT_KEY_ID=your-key-id
AUTOCOUNT_API_KEY=your-api-key
AUTOCOUNT_BASE_URL=https://accounting-api.autocountcloud.com
AUTOCOUNT_SALES_LOCATION=HQ
AUTOCOUNT_SALES_ACC_NO=500-0000
```

## Deploy With GitHub + Vercel

1. Push this project to a GitHub repository.
2. Go to [Vercel](https://vercel.com/).
3. Import the GitHub repository.
4. Add the environment variables above in Vercel Project Settings.
5. Deploy.

Do not deploy this as GitHub Pages only. GitHub Pages is static and cannot safely hide AutoCount API credentials.

## Behavior

- AutoCount controls invoice numbering because the app does not send `docNo`.
- `saveApprove` is `false`, so invoices are created but not auto-approved.
- API credentials are read only by server-side API routes.
