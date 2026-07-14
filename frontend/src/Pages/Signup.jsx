import { useForm} from "react-hook-form"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { API_URL } from "../utils/api";



export default function Signup() {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit
      } = useForm()

      const onsubmit = async (data) => {
        setIsLoading(true);

    
        const wakeupTimer = setTimeout(() => {
          toast.info("Server is waking up, this can take up to 40 seconds ⏳");
        }, 4000);

        try {
          const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!response.ok) {
            toast.error(result.message || "Signup failed");
            return;
          }

          sessionStorage.setItem("pendingVerificationEmail", result.email);
          toast.success("OTP sent to your email ✅");
          navigate("/verifyemail", { state: { email: result.email } });
        } catch {
          toast.error("Something went wrong. Please check your connection and try again.");
        } finally {
          clearTimeout(wakeupTimer);
          setIsLoading(false);
        }
      };
    

  return (
    <form onSubmit={handleSubmit(onsubmit)}>
    <div className="mt-8">

   
      <div className="mb-5">
        <label className="block text-gray-300 mb-2 font-medium">
          Full Name
        </label>

        <input
          {...register("fullname")}
          type="text"
          placeholder="Enter your full name"
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-all duration-300 disabled:opacity-50"
        />
      </div>

  
      <div className="mb-5">
        <label className="block text-gray-300 mb-2 font-medium">
          Email
        </label>

        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email"
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-all duration-300 disabled:opacity-50"
        />
      </div>

  
      <div className="mb-5">
        <label className="block text-gray-300 mb-2 font-medium">
          Password
        </label>

        <input
          {...register("password")}
          type="password"
          placeholder="Create a password"
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-all duration-300 disabled:opacity-50"
        />
      </div>


     

      <button
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 py-3 rounded-xl text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            Please wait...
          </>
        ) : (
          "Create Account"
        )}
      </button>

    </div>
    </form>
  );
}
