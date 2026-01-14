import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSignIn } from "@/mutations/useSignIn";
import { useSignUp } from "@/mutations/useSignUp";
import { useProfile } from "@/queries/useProfile";

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().optional().or(z.literal("")),
    mode: z.enum(["login", "signup"]),
  })
  .refine(
    (data) => data.mode === "login" || data.password === data.confirmPassword,
    { path: ["confirmPassword"], message: "Passwords do not match" }
  )
  .refine(
    (data) => {
      if (data.mode === "signup" && !data.confirmPassword) {
        return false;
      }
      return true;
    },
    { path: ["confirmPassword"], message: "Please confirm your password" }
  );

type FormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: signIn, isPending: isSignInPending } = useSignIn();
  const { mutate: signUp, isPending: isSignUpPending } = useSignUp();
  const { data: profile } = useProfile();
  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      mode: "login",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const mode = watch("mode");

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;
    try {
      if (data.mode === "signup") {
        signUp({ email, password });
      } else {
        signIn({ email, password });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(`Error during ${mode}: ${error.message}`);
      } else {
        toast.error(`An unexpected error occurred during ${mode}`);
      }
    }
  };

  useEffect(() => {
    if (profile) navigate("/");
  }, [profile, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");

    if (emailParam && mode === "login") {
      setValue("email", emailParam);
      setValue("password", import.meta.env.VITE_DEMO_PASSWORD || "");
      setIsDemoMode(true);
    }
  }, [location, mode, setValue]);

  const Showtext = ({
    isSignUpPending,
    isSignInPending,
  }: {
    isSignUpPending: boolean;
    isSignInPending: boolean;
  }) => {
    if (!isSignInPending && !isSignUpPending) {
      if (mode === "login") {
        return "Sign in";
      } else {
        return "Sign up";
      }
    } else if (isSignInPending) {
      return "Signing In...";
    } else if (isSignUpPending) {
      return "Signing Up...";
    }
  };

  return (
    <div className="flex items-center justify-center flex-col mt-8">
      <Card className="w-full max-w-md shadow-none border rounded">
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
              <div className="relative">
                <Input
                  className="rounded"
                  id="email"
                  type="email"
                  {...register("email")}
                />
                <Activity
                  mode={isDemoMode && mode === "login" ? "visible" : "hidden"}
                >
                  <Badge className="bg-primary-400 rounded ml-auto absolute right-2 top-1/2 -translate-y-1/2">
                    Demo Mode
                  </Badge>
                </Activity>
              </div>

              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  className="rounded"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <Button
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 rounded rounded-l-none  flex items-center hover:text-gray-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  className="rounded"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardAction className="mx-4">
            <Button
              className="rounded"
              variant="link"
              type="button"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </Button>
          </CardAction>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isSignInPending || isSignUpPending}
              className="w-full rounded"
            >
              {Showtext({ isSignInPending, isSignUpPending })}
            </Button>
            {/* <Button
              type="button"
              onClick={async () => {
                const result = await signInWithPopup(
                  auth,
                  new GoogleAuthProvider()
                );
                await handleAuth(result.user);
              }}
              className="w-full"
            >
              Continue with Google
            </Button> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
