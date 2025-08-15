import { useEffect, useState } from "react"
import { db, auth } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  // onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  Timestamp,
  getDocs,
  setDoc,
} from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Notification } from "@/lib/types"
import { useNavigate } from "react-router-dom"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Notifications() {
  const navigate = useNavigate()
  const [user] = useAuthState(auth)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      toast.info("Please login to view notifications.")
      return
    }

    const checkInvitesAndLoadNotifications = async () => {
      try {
        const inviteSnap = await getDocs(
          query(collection(db, "invites"), where("email", "==", user.email))
        )

        const processedInviteIds = new Set<string>()

        for (const inviteDoc of inviteSnap.docs) {
          const invite = inviteDoc.data()
          const inviteId = inviteDoc.id

          if (processedInviteIds.has(inviteId)) continue
          processedInviteIds.add(inviteId)

          const existingNotifSnap = await getDocs(
            query(
              collection(db, "notifications"),
              where("toUserId", "==", user.uid),
              where("data.inviteId", "==", inviteId),
              where("type", "==", "invite_received")
            )
          )

          if (!existingNotifSnap.empty) continue

          await setDoc(doc(db, "notifications", `invite_${inviteId}`), {
            toUserId: user.uid,
            type: "invite_received",
            read: false,
            createdAt: Timestamp.now(),
            data: {
              email: invite.email,
              inviteId,
              businessId: invite.businessId,
              inviterId: invite.invitedBy,
            },
          })
        }

        const notifSnap = await getDocs(
          query(
            collection(db, "notifications"),
            where("toUserId", "==", user.uid)
          )
        )

        setNotifications(
          notifSnap.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Notification)
          )
        )
      } catch (error) {
        console.error("Failed to fetch invites or notifications", error)
        toast.error("Error loading notifications.")
      } finally {
        setLoading(false)
      }
    }

    checkInvitesAndLoadNotifications()
  }, [user?.uid])

  const handleAcceptInvite = async (notification: Notification) => {
    if (!user) return

    const { inviteId, businessId } = notification.data

    try {
      if (!inviteId) {
        toast.error("Invite ID not found in notification data")
        throw new Error("Invite ID not found in notification data")
      } else if (!businessId) {
        toast.error("Business ID not found in notification data.")
        throw new Error("Business ID not found in notification data")
      }

      const inviteDoc = await getDoc(doc(db, "invites", inviteId))
      if (!inviteDoc.exists()) {
        toast.error("Invite no longer exists.")
        return
      }

      await updateDoc(doc(db, "profiles", user.uid), {
        businessId,
        role: "vendor",
      })

      const updateProfile = await getDoc(doc(db, "profiles", user.uid))
      if (!updateProfile.exists() || updateProfile.data()?.role !== "vendor") {
        toast.error("Failed to update profile role to vendor.")
        throw new Error("Failed to update profile role to vendor.")
      }
      console.log("Profile updated to vendor role successfully.")

      await deleteDoc(doc(db, "invites", inviteId))
      await deleteDoc(doc(db, "notifications", notification.id))

      toast.success("Invite accepted! You've joined the business.")
      console.log("Toast success: Invite accepted! You've joined the business.")
      setNotificationDialogOpen(false)
      setSelectedNotification(null)
      setTimeout(() => {
        navigate("/")
      }, 1500)
    } catch (error) {
      console.error(error)
      toast.error("Failed to accept invite.")
      setNotificationDialogOpen(false)
      setSelectedNotification(null)
      return
    }
  }

  const handleDeclineInvite = async (notification: Notification) => {
    try {
      const { inviteId, inviterId } = notification.data

      if (!inviteId) {
        toast.error("Invite ID not found in notification data")
        throw new Error("Invite ID not found in notification data")
      } else if (!notification.id) {
        toast.error("Notification ID not found in notification data")
        throw new Error("Notification ID not found in notification data")
      }

      await setDoc(
        doc(db, "notifications", `declined_${inviterId}_${inviteId}`),
        {
          toUserId: inviterId,
          type: "invite-declined",
          read: false,
          createdAt: Timestamp.now(),
          data: {
            declinedBy: user?.email,
          },
        }
      )
      await deleteDoc(doc(db, "invites", inviteId))
      await deleteDoc(doc(db, "notifications", notification.id))

      toast.success("Invite declined.")
    } catch (error) {
      console.error(error)
      toast.error("Error declining invite.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-6 w-6 text-muted" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No notifications
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>

      {notifications.length === 0 && (
        <p className="text-muted-foreground">No notifications</p>
      )}

      {notifications.map((n) => (
        <div key={n.id} className="border rounded-lg p-4 shadow-sm bg-white">
          {n.type === "invite_received" && (
            <>
              <p>
                You’ve been invited by <strong>{n.data.email}</strong> to join a
                business.
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedNotification(n)
                  setNotificationDialogOpen(true)
                }}
                className="mt-2"
              >
                Respond
              </Button>
            </>
          )}

          {n.type === "invite_accepted" && (
            <p>
              <strong>{n.data.email}</strong> accepted your invite.
            </p>
          )}

          {n.type === "invite_declined" && (
            <p>
              <strong>{n.data.declinedBy}</strong> declined your invite.
            </p>
          )}
        </div>
      ))}

      <AlertDialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to accept the invite from{" "}
              <strong>{selectedNotification?.data.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <Button
              variant="default"
              onClick={() => {
                if (!selectedNotification) return
                handleAcceptInvite(selectedNotification)
              }}
            >
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedNotification) return
                handleDeclineInvite(selectedNotification)
              }}
            >
              Decline
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
