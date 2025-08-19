import './globals.css'

export const metadata = {
  title: 'Gambino Coin - Farm Luck, Mine Destiny',
  description: 'The cryptocurrency that rewards the luckiest people on Earth',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
