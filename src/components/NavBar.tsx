import { useState, useEffect, Activity } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlignJustify, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hook/useAuth";
import { Spinner } from "./ui/spinner";

const NavLink = ({
  text,
  link,
  onClick,
}: {
  text: string;
  link: string;
  onClick?: () => void;
}) => {
  return (
    <li className="py-2 grid place-items-center lg:mx-3">
      <Link
        to={link}
        onClick={onClick}
        className="p-2 text-center text-base md:text-sm font-medium hover:underline"
      >
        {text}
      </Link>
    </li>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, signOutLoading, signOutUser } = useAuth();
  const location = useLocation();
  console.log({ profile });

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const closeNavbar = () => {
    if (window.innerWidth > 768) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div
      id="navbar"
      className="h-16 w-full bg-white border-b border-neutral-200 flex items-center justify-between md:px-16 sm:px-10 px-4 fixed top-0 transition-all ease-in-out duration-300 z-50"
    >
      <div className="flex items-center gap-2">
        <Link
          to={profile ? "/" : "/login"}
          className="text-lg font-medium text-black flex items-center hover:underline gap-x-2"
        >
          Stokinator
        </Link>
      </div>

      <Activity
        mode={
          location.pathname === "/login" ||
          location.pathname === "/forgot-password" ||
          location.pathname === "/reset-password"
            ? "hidden"
            : "visible"
        }
      >
        <div className="md:hidden">
          <Button
            onClick={toggleNavbar}
            className="active:scale-125 transition-transform"
            size={"icon"}
          >
            <AlignJustify size={24} />
          </Button>
        </div>
      </Activity>
      <div
        className={`fixed md:static top-0 right-0 h-screen md:h-auto w-full md:w-auto bg-gray-50 border-l md:border-none border-gray-300 md:bg-transparent shadow-lg md:shadow-none transition-transform duration-300 ease-in-out transform flex-1 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0 z-60`}
      >
        <div className="w-full md:hidden flex items-center justify-between px-6 border-b-2">
          <Link
            to={profile ? "/" : "/login"}
            className="text-lg font-semibold text-black flex items-center gap-x-2"
            onClick={closeNavbar}
          >
            Stokinator
          </Link>

          <div className="md:hidden flex justify-end py-4">
            <Button
              onClick={toggleNavbar}
              className="active:scale-125 transition-transform"
              size={"icon"}
            >
              <X size={28} />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row items-center justify-between md:justify-center gap-6 p-6 md:p-0">
          <ul className="flex flex-col md:flex-row items-center text-base gap-4 md:gap-1 text-neutral-700 font-normal">
            <Activity mode={profile?.business_id ? "visible" : "hidden"}>
              <>
                <NavLink
                  text="Products"
                  link="/products"
                  onClick={closeNavbar}
                />
                <NavLink
                  text="Transactions"
                  link="/transactions"
                  onClick={closeNavbar}
                />
              </>
            </Activity>
            <Activity
              mode={!profile || profile.business_id ? "hidden" : "visible"}
            >
              <NavLink
                link="/register-business"
                text="Create Business"
                onClick={closeNavbar}
              />
            </Activity>
            <Activity mode={profile ? "visible" : "hidden"}>
              <NavLink
                link="/notifications"
                text="Notifications"
                onClick={closeNavbar}
              />
            </Activity>
          </ul>

          <Activity mode={profile ? "visible" : "hidden"}>
            <Button
              variant={"destructive"}
              size={"lg"}
              onClick={() => {
                signOutUser();
                closeNavbar();
              }}
              className="md:hidden flex rounded"
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
          className="hidden md:flex rounded"
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
