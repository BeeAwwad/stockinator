import { Link, useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"

const Header = () => {
  const [user] = useAuthState(auth)
  const [role, setRole] = useState<string | null>(null)
  console.log("🚀 ~ Header ~ role:", role)
  const [hasBusiness, setHasBusiness] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)
      const profileData = profileSnap.data()

      if (profileData) {
        setRole(profileData.role)
        setHasBusiness(!!profileData.businessId)
      }
    }
    fetchProfile()
  }, [user])

  const logout = async () => {
    await auth.signOut()
    navigate("/login")
  }

  if (!user) return null

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
      <div className="space-x-4">
        {hasBusiness && (
          <>
            <Link to="/" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/products" className="hover:underline">
              Products
            </Link>
            <Link to="/transactions" className="hover:underline">
              Transactions
            </Link>
          </>
        )}
        {!hasBusiness && (
          <Link to="/create-business" className="hover:underline">
            Create Business
          </Link>
        )}
      </div>
      <div>
        <button
          onClick={logout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}

export default Header
