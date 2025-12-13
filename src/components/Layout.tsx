import Navbar from "./NavBar";

import { Toaster } from "./ui/sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="p-6 pt-18 bg-gray-100 min-h-screen">
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        {children}
      </main>
    </>
  );
};

export default Layout;
