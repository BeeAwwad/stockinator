import Header from "./Header"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="p-6">{children}</main>
    </>
  )
}

export default Layout
