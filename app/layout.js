import "./styles.css";

export const metadata = {
  title: "AutoCount Job Orders",
  description: "Create local job orders and post them to AutoCount Cloud Accounting invoices."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
