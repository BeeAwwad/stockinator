import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  // updateProfile,
} from "firebase/auth"
import { auth, db } from "../lib/firebase"
import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { User } from "firebase/auth"
import { toast } from "sonner"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Layout from "@/components/Layout"

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().optional(),
    // displayName: z.string(),
    mode: z.enum(["login", "signup"]),
  })
  .refine(
    (data) => data.mode === "login" || data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }
  )

type FormData = z.infer<typeof loginSchema>

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      // displayName: "",
      mode: "login",
    },
  })

  const { register, handleSubmit, watch, formState } = form
  const { errors } = formState
  const mode = watch("mode")

  const handleAuth = async (user: User) => {
    const { uid, displayName, email } = user
    const profileRef = doc(db, "profiles", uid)
    let role = "pending"

    try {
      const profileSnap = await getDoc(profileRef)

      if (profileSnap.exists()) {
        const profile = profileSnap.data()
        role = profile?.role || "pending"
      } else {
        if (!email) {
          toast.error("Missing email. Cannot proceed.")
          return
        }

        // Check invites
        const inviteQuery = query(
          collection(db, "invites"),
          where("email", "==", email)
        )
        const invitedSnap = await getDocs(inviteQuery)

        if (!invitedSnap.empty) {
          const inviteDoc = invitedSnap.docs[0]
          const inviteData = inviteDoc.data()

          await setDoc(profileRef, {
            role: "vendor",
            businessId: inviteData.businessId,
            displayName: displayName || email,
            createdAt: new Date(),
          })

          try {
            await deleteDoc(inviteDoc.ref)
          } catch (err) {
            console.error("Failed to delete invite:", err)
            toast.error("Failed to delete invite after registration.")
          }
          role = "vendor"
        } else {
          await setDoc(profileRef, {
            role: "pending",
            businessId: null,
            displayName: displayName || email,
            createdAt: new Date(),
          })
        }
      }

      // Navigate
      navigate(
        role === "owner" || role === "vendor" ? "/" : "/register-business"
      )
    } catch (err) {
      console.error("Auth error:", err)
      toast.error("Login failed. Check console for details.")
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await handleAuth(result.user)
    } catch (err) {
      console.error("Google login failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      if (data.mode === "signup") {
        await createUserWithEmailAndPassword(auth, data.email, data.password)

        // Wait for the auth state to confirm user is signed in
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            await handleAuth(user)
            unsubscribe() // Clean up listener
          }
        })
      } else {
        const result = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        )
        await handleAuth(result.user)
      }
    } catch (err) {
      console.log("onSubmit ~ Email auth error:", err)
      toast.error("Login or registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-center mt-8">
        <Card className="w-full py-6 max-w-sm md:max-w-md lg:max-w-lg">
          <CardHeader>
            <CardTitle>
              {mode === "signup" ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {mode === "signup"
                ? "Enter your email to create your account"
                : "Enter your email to login to your account"}
            </CardDescription>
            <CardAction>
              <Button
                variant="link"
                onClick={() =>
                  form.setValue("mode", mode === "login" ? "signup" : "login")
                }
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </Button>
            </CardAction>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: true })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.password?.message}
                    </p>
                  )}
                </div>
                {/* {mode === "signup" && (
                <div className="grid gap-2">
                  <Label htmlFor="displayName">User Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    {...register("displayName")}
                  />
                </div>
              )} */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  {/* <Link to={"#"} className="ml-auto inline-block text-sm underline-offset-4 hover:underline">Forgot your password?</Link> */}
                  <Input
                    id="password"
                    type="password"
                    {...register("password", { required: true })}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                {mode === "signup" && (
                  <div className="grid gap-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" {...register("confirmPassword")} />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right py-3">
                {mode === "login" && (
                  <Link
                    to="/rest-password"
                    className="text-sm underline-offset-4 hover:underline inline-block"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading
                  ? mode === "signup"
                    ? "Creating..."
                    : "Signing in..."
                  : mode === "signup"
                  ? "Sign Up"
                  : "Login"}
              </Button>
              <Button
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
                type="button"
              >
                Continue with Google
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  )
}

export default Login
