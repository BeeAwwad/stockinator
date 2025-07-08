import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import type { ProfileType } from "@/utils/types"
import AddVendor from "@/components/AddVendor"
import VendorList from "@/components/VendorList"

const Dashboard = () => {
  const [user] = useAuthState(auth)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  //   const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        const profileRef = doc(db, "profiles", user.uid)
        const snap = await getDoc(profileRef)
        setProfile(snap.data() as ProfileType)
      }
      loadProfile()
    }
  }, [user])

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {profile && (
          <div>
            <p>Role: {profile.role}</p>
            <p>Business ID: {profile.businessId ?? "Not assigned"}</p>
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
