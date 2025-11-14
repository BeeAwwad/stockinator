import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hook/useAuth";

const Header = () => {
  const { loading, profile } = useAuth();

  const [hasBusiness, setHasBusiness] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      if (!profile) return;

      setHasBusiness(!!profile?.business_id);
    }
    if (!loading) fetchProfile();
  }, [profile, loading]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
            {hasBusiness && (
              <>
                <Link to="/products" className="hover:underline">
                  Products
                </Link>
                <Link to="/transactions" className="hover:underline">
                  Transactions
                </Link>
              </>
            )}

            {!profile || hasBusiness ? (
              <></>
            ) : (
              <>
                <Link to="/register-business" className="hover:underline">
                  Create Business
                </Link>
              </>
            )}

            {profile && (
              <Link to="/notifications" className="hover:underline">
                Notifications
              </Link>
            )}
          </div>
          {profile && (
            <Button
              onClick={logout}
              className="bg-rose-500 px-3 py-1 hover:bg-rose-600"
            >
              Sign Out
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
