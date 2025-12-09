import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { passwordResetSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

type ResetPasswordFormProps = z.infer<typeof passwordResetSchema>;

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const { 
        register,
	handleSubmit,
	formState: { errors },	
  } = useForm<ResetPasswordFormProps>({
 	resolvers: zodResolver(passwordResetSchema),
	defaultValues: {
		newPassword: "",
		confirmPassword: "",		
	},
  })
 
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
   const onSubmit = async (data: ResetPasswordFormProps) => {
    try {
     setIsLoading(true);
     const { newPassword } = data;

     const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password Update Error:", error);
        toast.error(`Failed to update password: ${error.message}`);
        return;
      }

      toast.success(
        "Password updated successfully! You are now logged in."
      );
      navigate("/");
    } catch (err) {
      console.error("Unexpected Update Error:", err);
      toast.error("An unexpected error occurred during password update.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col mt-8">
      <Card className="w-full max-w-md">
      <CardHeader>   
      	<CardTitle>Set New Password</CardTitle>
	<CardDescription>Enter your new password</CardDescription>
      </CardHeader> 
       	<form onSubmit={handleSubmit(onSubmit)}>
         <CardContent className="space-y-4 mb-8"> 
          <div className="space-y-2">
            <Label htmlFor="new-password-field">
              New Password
            </Label>
            <div className="mt-1 relative">
              <Input
                id="new-password-field"
                type={showPassword ? "text" : "password"}
             	{...register("newPassword")} 
		/>
              <Button
		size="icon"
              	type="button" 
	       	onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 rounded-l-none  flex items-center hover:text-gray-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
	   {errors.newPassword && (
		<p className="mt-2 text-xs text-red-600">{errors.newPassword?.message}</p>  
	   )}
           </div>
          <div>
            <Label htmlFor="confirm-password-field">
              Confirm New Password
            </Label>
            <div className="mt-1 relative">
              <Input
                id="confirm-password-field"
                type={showPassword ? "text" : "password"}
		{...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-xs text-red-600">{errors.confirmPassword?.message}</p>
            )}
          </div>
	</CardContent>
	<CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
	</CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordForm;
