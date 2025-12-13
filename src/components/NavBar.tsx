import { useState, useEffect, Activity } from "react";
import { Link } from "react-router-dom";
import { AlignJustify, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hook/useAuth";
import { Spinner } from "./ui/spinner";

const NavLink = ({ text, link }: { text: string; link: string }) => {
  return (
    <li className="py-2 grid place-items-center lg:mx-5">
      <Link
        to={link}
        className="p-2 lg:w-28 text-center text-base md:text-sm rounded font-bold hover:bg-slate-800 hover:text-white"
      >
        {text}
      </Link>
    </li>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, signOutLoading, signOutUser } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  // Adding event listener on mount and removing on unmount
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      id="navbar"
      className={`h-16 w-full bg-white border-b border-neutral-200 flex items-center justify-between md:px-16 sm:px-10 px-4 fixed top-0 transition-all ease-in-out duration-300 z-50 ${
        isScrolled ? "" : ""
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link
          to={profile ? "/" : "/login"}
          className="text-lg font-medium text-black flex items-center hover:underline gap-x-2"
        >
          Stokinator
        </Link>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="md:hidden">
        <Button onClick={toggleNavbar} size={"icon"}>
          <AlignJustify size={24} />
        </Button>
      </div>

      {/* Navbar items and buttons */}
      <div
        className={`fixed md:static top-0 right-0 h-screen md:h-auto w-full md:w-auto bg-gray-50 border-l md:border-none border-gray-300 md:bg-transparent shadow-lg md:shadow-none transition-transform duration-300 ease-in-out transform flex-1 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0 z-60`}
      >
        <div className="w-full md:hidden flex items-center justify-between px-6 border-b-2">
          {/* Logo */}
          <Link
            to={profile ? "/" : "/login"}
            className="text-lg font-semibold text-black flex items-center gap-x-2"
          >
            Stokinator
          </Link>

          <div className="md:hidden flex justify-end py-4">
            <Button onClick={toggleNavbar} size={"icon"}>
              <X size={28} />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row items-center justify-between md:justify-center gap-6 p-6 md:p-0">
          {/* Navbar items */}
          <ul className="flex flex-col md:flex-row items-center text-base gap-4 text-neutral-700 font-normal">
            <Activity mode={profile?.business_id ? "visible" : "hidden"}>
              <>
                <NavLink text="Products" link="/products" />
                <NavLink text="Transactions" link="/transactions" />
              </>
            </Activity>
            <Activity
              mode={!profile || profile.business_id ? "hidden" : "visible"}
            >
              <NavLink link="/register-business" text="Create Business" />
            </Activity>
            <Activity mode={profile ? "visible" : "hidden"}>
              <NavLink link="/notifications" text="Notifications" />
            </Activity>
          </ul>

          <Activity mode={profile ? "visible" : "hidden"}>
            <Button
              variant={"destructive"}
              size={"lg"}
              onClick={signOutUser}
              className="md:hidden"
            >
              <Activity mode={signOutLoading ? "visible" : "hidden"}>
                <Spinner />
              </Activity>
              Sign Out
            </Button>
          </Activity>
        </div>
      </div>

      <Activity mode={profile ? "visible" : "hidden"}>
        <Button
          variant={"destructive"}
          onClick={signOutUser}
          className="hidden md:block"
        >
          <Activity mode={signOutLoading ? "visible" : "hidden"}>
            <Spinner />
          </Activity>
          Sign Out
        </Button>
      </Activity>
    </div>
  );
};

export default Navbar;
