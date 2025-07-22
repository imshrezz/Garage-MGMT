import { LoginForm } from "@/components/auth/LoginForm";

export const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-garage-blue">
            Carageer The Garage
          </h1>
          <p className="text-sm text-muted-foreground">
            Garage Management System
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
