import { Link, useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../lib/firebase"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "./ui/button"

const Header = () => {
  const [user] = useAuthState(auth)
  const [hasBusiness, setHasBusiness] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)
      const profileData = profileSnap.data()

      if (profileData) {
        setHasBusiness(!!profileData.businessId)
      }
    }
    fetchProfile()
  }, [user])

  const logout = async () => {
    await auth.signOut()
    navigate("/login")
  }

  return (
    <header className="bg-gray-800">
      <nav className="text-white h-14 md:h-16 px-4 py-3 flex items-center justify-between text-xs md:text-sm mx-auto max-w-lg md:max-w-xl lg:max-w-5xl 2xl:max-w-7xl">
        <div className="flex justify-between items-center w-full space-x-4">
          <Link to="/" className="hover:underline font-medium">
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
            {hasBusiness || !user ? (
              <></>
            ) : (
              <Link to="/create-business" className="hover:underline">
                Create Business
              </Link>
            )}
          </div>
          {user && (
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
  )
}

export default Header
