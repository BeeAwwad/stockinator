import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth"
import type { User as FirebaseUser } from "firebase/auth"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { auth, db } from "../lib/firebase"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().optional(),
    mode: z.enum(["login", "signup"]),
  })
  .refine(
    (data) => data.mode === "login" || data.password === data.confirmPassword,
    { path: ["confirmPassword"], message: "Passwords do not match" }
  )

type FormData = z.infer<typeof loginSchema>

const Login = () => {
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      mode: "login",
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form
  const mode = watch("mode")

  const handleAuth = async (user: FirebaseUser) => {
    const { uid, email, displayName } = user
    const profileRef = doc(db, "profiles", uid)
    const profileSnap = await getDoc(profileRef)

    if (profileSnap.exists()) {
      const profile = profileSnap.data()
      const role = profile?.role || "pending"
      navigate(role === "owner" ? "/register-business" : "/notifications")
      return
    }

    await setDoc(profileRef, {
      role: "pending",
      businessId: null,
      displayName: displayName || email,
      createdAt: Timestamp.now(),
    })

    navigate("/notifications")
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      if (data.mode === "signup") {
        await createUserWithEmailAndPassword(auth, data.email, data.password)
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            await handleAuth(user)
            unsubscribe()
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
      toast.error(`${mode} failed`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center flex-col mt-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "signup" ? "Sign Up" : "Sign In"}</CardTitle>
          <CardDescription>
            {mode === "signup"
              ? "Enter your email to create an account"
              : "Enter your email to log in"}
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
          <CardContent className="space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? mode === "signup"
                  ? "Creating..."
                  : "Signing in..."
                : mode === "signup"
                ? "Sign Up"
                : "Login"}
            </Button>
            <Button
              type="button"
              onClick={async () => {
                const result = await signInWithPopup(
                  auth,
                  new GoogleAuthProvider()
                )
                await handleAuth(result.user)
              }}
              className="w-full"
            >
              Continue with Google
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Login
