import Navbar from "./NavBar";

import { Toaster } from "./ui/sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="p-6 mt-18">
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        {children}
      </main>
    </>
  );
};

export default Layout;
