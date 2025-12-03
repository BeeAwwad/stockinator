import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useAuth } from "@/hook/useAuth";

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

  const navigate = useNavigate();
  const { signInUser, signUpNewUser, profile } = useAuth();

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
        toast.error(error.message);
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
