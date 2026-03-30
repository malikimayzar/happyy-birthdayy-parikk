import './globals.css'

export const metadata = {
  title: 'Lovescape — Happy Birthday Alexsa 🎂',
  description: 'A special birthday surprise just for you.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
