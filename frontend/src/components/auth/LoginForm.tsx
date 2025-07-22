// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Link } from "react-router";
// import { toast } from "sonner";

// const formSchema = z.object({
//   email: z.string().email({ message: "Please enter a valid email address" }),
//   password: z
//     .string()
//     .min(6, { message: "Password must be at least 6 characters" }),
// });

// type FormValues = z.infer<typeof formSchema>;

// export const LoginForm = () => {
//   const [isLoading, setIsLoading] = useState(false);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = async (values: FormValues) => {
//     setIsLoading(true);

//     try {
//       // This is a mock login function
//       // It would normally communicate with your backend
//       console.log("Logging in with:", values);

//       // Simulate API call delay
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Successful login simulation
//       toast.success("Logged in successfully!");

//       // In a real app, you would redirect after successful login
//       window.location.href = "/";
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error("Login failed. Please check your credentials.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-md space-y-6">
//       <div className="text-center">
//         <h2 className="text-2xl font-bold text-garage-blue">Welcome Back!</h2>
//         <p className="mt-2 text-muted-foreground">
//           Log in to your garage management account
//         </p>
//       </div>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Email</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder="your@email.com"
//                     type="email"
//                     autoComplete="email"
//                     disabled={isLoading}
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="password"
//             render={({ field }) => (
//               <FormItem>
//                 <div className="flex items-center justify-between">
//                   <FormLabel>Password</FormLabel>
//                   <Link
//                     to="/forgot-password"
//                     className="text-sm font-medium text-garage-blue hover:underline"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <FormControl>
//                   <Input
//                     placeholder="••••••••"
//                     type="password"
//                     autoComplete="current-password"
//                     disabled={isLoading}
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <Button
//             type="submit"
//             className="w-full text-blue-500 hover:bg-blue-100"
//             disabled={isLoading}
//           >
//             {isLoading ? "Logging in..." : "Login"}
//           </Button>

//           <div className="text-center text-sm">
//             <span className="text-muted-foreground">
//               Don't have an account?
//             </span>{" "}
//             <Link
//               to="/register"
//               className="font-medium text-garage-blue hover:underline"
//             >
//               Sign up
//             </Link>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// };

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "react-router";
import { toast } from "sonner";
import api from "@/lib/axios";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", values);
      const { token, user } = res.data;

      // Save token (use cookies or localStorage as needed)
      localStorage.setItem("garage_token", token);
      localStorage.setItem("garage_user", JSON.stringify(user));

      toast.success("Logged in successfully!");

      // Redirect to dashboard or home
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-garage-blue">Welcome Back!</h2>
        <p className="mt-2 text-muted-foreground">
          Log in to your garage management account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-garage-blue hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full text-blue-500 hover:bg-blue-100"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
