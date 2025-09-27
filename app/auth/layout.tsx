export const metadata = {
  title: 'FabriiQ Authentication',
  description: 'Sign in to FabriiQ platform',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}
