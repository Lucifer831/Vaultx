import { useForm} from "react-hook-form"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../utils/api";



export default function Signup() {

  const navigate = useNavigate();

    const {
        register,
        handleSubmit
      } = useForm()

      const onsubmit = async (data) => {
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
          toast.error("Backend is not running on port 8080");
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
          className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-all duration-300"
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
          className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-all duration-300"
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
          className="w-full px-4 py-3 rounded-xl bg-[#1d1d1d] border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-all duration-300"
        />
      </div>


     

      <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 py-3 rounded-xl text-white font-semibold">
        Create Account
      </button>

    </div>
    </form>
  );
}
