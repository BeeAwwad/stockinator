import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import type { ProfileType } from "@/utils/types"
import AddVendor from "@/components/AddVendor"
import VendorList from "@/components/VendorList"

const Dashboard = () => {
  const [user] = useAuthState(auth)
  const [profile, setProfile] = useState<ProfileType | null>(null)
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
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {profile && (
          <div>
            {profile.role === null && (
              <p className="text-yellow-600">
                You haven't registered a business yet.
              </p>
            )}
            {profile.role === "owner" && (
              <p>You're the owner of this business.</p>
            )}
            {profile.role === "vendor" && (
              <p>You are a vendor for this business.</p>
            )}

            {businessName ? (
              <p className="mt-2">
                Business Name: <strong>{businessName}</strong>
              </p>
            ) : (
              <p className="mt-2 text-gray-500">Loading business name...</p>
            )}

            <p className="text-sm text-gray-600">
              Business ID: {profile.businessId ?? "Not assigned"}
            </p>
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
