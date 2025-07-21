import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Layout from "@/components/Layout"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null)

  const handleReset = async () => {
    const now = Date.now()
    if (lastRequestTime && now - lastRequestTime < 30000) {
      toast.error(
        "Please wait 30 seconds before requesting another reset email"
      )
      return
    }

    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${import.meta.env.VITE_URL}/reset-complete`,
        handleCodeInApp: false,
      })
      toast.success("If the email exists, a reset link has been sent.")
      setLastRequestTime(now)
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message
          : "Failed to send reset email"
      toast.error(errorMessage || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-center mt-8">
        <Card className="w-full py-6 max-w-sm md:max-w-md lg:max-w-lg">
          <CardHeader>
            <CardTitle className="croll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleReset} disabled={loading || !email}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  )
}
