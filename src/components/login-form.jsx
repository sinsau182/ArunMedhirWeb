import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { loginUser } from "@/redux/slices/authSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { setItem } from "@/redux/slices/sessionStorageSlice"; // Import setItem action
import { updateSessionActivity } from "@/utils/sessionManager";
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if the email is a superadmin email (you can modify this condition based on your requirements)
      const isSuperadmin = credentials.email.toLowerCase().includes('superadmin');
      
      const result = await dispatch(loginUser({ 
        credentials,
        isSuperadmin 
      }));

      if (result.meta.requestStatus === "fulfilled") {
        const token = result.payload.token;

        if (typeof window !== "undefined") {
          dispatch(setItem({ key: "token", value: token, encrypt: true }));
          updateSessionActivity();
        }

        const roles = sessionStorage.getItem("roles");

        if (roles.includes("SUPERADMIN")) {
          router.push("/superadmin/companies");
        } else if (roles.includes("EMPLOYEE")) {
          router.push("/employee/dashboard");
          sessionStorage.setItem("currentRole", "EMPLOYEE");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      toast.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Email account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="flex flex-col gap-4"></div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="********"
                    required
                    value={credentials.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="#" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
