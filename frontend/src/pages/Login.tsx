import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [user, setUser] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(user.email, user.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUser((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  return (
    <div className="flex items-center flex-col  justify-center h-screen">
      <h1 className="text-amber-800 text-4xl font-bold justify-center mb-7">
        Login Page
      </h1>
      <div className="text-left justify-between gap-5 flex flex-col">
        <div className="flex flex-column gap-5">
          <div>Email Id</div>
          <input
            placeholder="Email Id"
            name="email"
            onChange={handleChange}
            className="border-2"
          />
        </div>
        <div className="flex flex-column justify-center gap-2">
          <div>Password</div>
          <input
            placeholder="Password"
            name="password"
            onChange={handleChange}
            type="password"
            className="border-2"
          />
        </div>
        <div className="flex justify-center">
          <button
            className="flex flex-col bg-blue-950 ml-12 justify-center text-white pr-5 pl-5 pt-1 pb-1"
            onClick={handleLogin}
          >
            Submit
          </button>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Login;
