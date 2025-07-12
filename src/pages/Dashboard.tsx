import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import type { ProfileType } from "@/lib/types"
import AddVendor from "@/components/AddVendor"
import VendorList from "@/components/VendorList"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const [user] = useAuthState(auth)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  console.log("🚀 ~ Dashboard ~ profile:", profile)
  const [businessName, setBusinessName] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const loadProfileAndBusiness = async () => {
        const profileRef = doc(db, "profiles", user.uid)
        const profileSnap = await getDoc(profileRef)

        if (!profileSnap.exists()) return

        const profileData = profileSnap.data() as ProfileType
        setProfile(profileData)

        if (profileData.businessId) {
          const businessRef = doc(db, "businesses", profileData.businessId)
          const businessSnap = await getDoc(businessRef)

          if (businessSnap.exists()) {
            const { name } = businessSnap.data()
            setBusinessName(name)
          }
        }
      }

      loadProfileAndBusiness()
    }
  }, [user])

  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {profile && (
          <div className="space-y-1">
            {businessName ? (
              <p className="mt-2">
                Business Name:{" "}
                <span className="font-semibold">{businessName}</span>
              </p>
            ) : (
              <p className="mt-2 text-gray-500">Loading business name...</p>
            )}

            {profile.role === null && (
              <p className="text-yellow-600">
                Create a business first.
                <Link to="/create-business" className="hover:underline">
                  Create Business
                </Link>
              </p>
            )}
            {profile.role === "owner" && (
              <>
                <p>
                  Email: <span className="font-semibold">{profile.email}</span>
                </p>
                <p>You are the owner of this business.</p>
              </>
            )}
            {profile.role === "vendor" && (
              <>
                <p>
                  Email: <span className="font-semibold">{profile.email}</span>
                </p>
                <p>You are a vendor for this business.</p>
              </>
            )}
          </div>
        )}

        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => auth.signOut()}
        >
          Sign Out
        </button>
      </div>

      <AddVendor />
      <VendorList />
    </Layout>
  )
}

export default Dashboard
