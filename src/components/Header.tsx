import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { useAuth } from "@/hook/useAuth";
import { Activity } from "react";

const Header = () => {
  const { profile, signOutLoading, signOutUser } = useAuth();

  return (
    <header className="bg-gray-800">
      <nav className="text-white h-14 md:h-16 px-4 py-3 flex items-center justify-between text-xs md:text-sm mx-auto max-w-lg md:max-w-xl lg:max-w-5xl 2xl:max-w-7xl">
        <div className="flex justify-between items-center w-full space-x-4">
          <Link
            to={profile ? "/" : "/login"}
            className="hover:underline font-medium"
          >
            Stockinator
          </Link>
          <div className="flex space-x-4">
            <Activity mode={profile?.business_id ? "visible" : "hidden"}>
              <>
                <Link to="/products" className="hover:underline">
                  Products
                </Link>
                <Link to="/transactions" className="hover:underline">
                  Transactions
                </Link>
              </>
	    </Activity>
            <Activity mode={!profile || profile.business_id ? "hidden" : "visible"}>
              <>
                <Link to="/register-business" className="hover:underline">
                  Create Business
                </Link>
              </>
            </Activity>

            <Activity mode={profile ? "visible" : "hidden"}>
              <Link to="/notifications" className="hover:underline">
                Notifications
              </Link>
            </Activity>
          </div>
          <Activity mode={profile ? "visible" : "hidden"}>
            <Button
              onClick={signOutUser}
              className="bg-rose-500 px-3 py-1 hover:bg-rose-600"
            >
   	      <Activity mode={signOutLoading ? "visible" : "hidden"}><Spinner /></Activity> 
              Sign Out
            </Button>
          </Activity>
        </div>
      </nav>
    </header>
  );
};

export default Header;
