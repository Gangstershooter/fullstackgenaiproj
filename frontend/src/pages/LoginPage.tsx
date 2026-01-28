import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
            AI
          </div>
          <h1 className="text-2xl font-semibold">Sign in to continue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your personal AI workspace
          </p>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            key={Date.now()}
            onSuccess={(credentialResponse) => {
                const token = credentialResponse.credential;
                if (!token) return;

                const decoded: any = jwtDecode(token);

                setAuth(
                {
                    id: decoded.sub,
                    name: decoded.name,
                    email: decoded.email,
                    picture: decoded.picture,
                },
                token
                );

                navigate("/");
            }}
            onError={() => {
                console.error("Google Login Failed");
            }}
            useOneTap={false}
            auto_select={false}
            />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Secure OAuth login • No passwords stored
        </p>
      </div>
    </div>
  );
}
