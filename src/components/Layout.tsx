import Header from "./Header"
import { Toaster } from "./ui/sonner"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="p-6">
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        {children}
      </main>
    </>
  )
}

export default Layout
