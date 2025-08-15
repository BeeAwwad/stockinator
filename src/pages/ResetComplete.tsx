import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function ResetComplete() {
  return (
    <div className="flex items-center justify-center mt-8">
      <Card className="w-full py-6 max-w-sm md:max-w-md lg:max-w-lg">
        <CardHeader>
          <CardTitle className="croll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center">
            Password Reset Successful!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Password has been successfully reset please sign in
          </p>
        </CardContent>
        <CardFooter className="text-center">
          <Link to="/login" className="w-full">
            <Button variant={"link"}>Go To Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
