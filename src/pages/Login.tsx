import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAppContext } from "@/hook/useAppContext";

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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signInUser, signUpNewUser, profile } = useAppContext();

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
    formState: { errors },
  } = form;
  const mode = watch("mode");

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Loading...");
      setLoading(true);
      if (data.mode === "signup") {
        const result = await signUpNewUser(data.email, data.password);
        if (result.success) {
          toast.success("Welcome");
        } else {
          console.log("couldn't sign up. success:", result.success);
          toast.error("Sorry we couldn't sign you up.");
        }
      } else {
        console.log("signing in...");
        const result = await signInUser(data.email, data.password);
        console.log("result:", result);
        if (result.success) {
          toast.success("Welcome back!");
        } else {
          console.log("error:", result.error);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(`Error during ${mode}: ${error.message}`);
      } else {
        toast.error(`An unexpected error occurred during ${mode}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) navigate("/");
  }, [profile]);

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
              <Input
                className="rounded"
                id="email"
                type="email"
                {...register("email")}
              />
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
            <Button type="submit" disabled={loading} className="w-full rounded">
              {loading
                ? mode === "signup"
                  ? "Creating..."
                  : "Signing in..."
                : mode === "signup"
                ? "Sign Up"
                : "Login"}
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
