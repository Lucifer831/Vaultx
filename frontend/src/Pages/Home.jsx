import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Mainleft from "./Mainleft";
import Mainright from "./Mainright";
import DashboardStats from "./DashboardStats";
import ActiveLinksList from "./ActiveLinksList";




export default function Home() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("drive"); // "drive" | "recent" | "starred" | "trash"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHome = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:8080/home", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        console.log("Status:", response.status);

        if (response.ok) {
          console.log(result);
        } else {
          setTimeout(() => {
            navigate("/qwerty");
          }, 2000);
        }
      } catch (error) {
        console.log(error);

        navigate("/qwerty");
      }
    };

    fetchHome();
  }, [navigate]);

  return (
    <>
     <div>
        <div>
           <Header searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
        </div>
        <div className="flex">
            <div className="w-[280px] shrink-0 h-[calc(100vh-80px)] bg-[#1c1b1c] overflow-y-auto">
            <Mainleft activeView={activeView} setActiveView={setActiveView}/>
            </div>
            <div className="flex-1 h-[calc(100vh-80px)] bg-[#131314] overflow-y-auto">
              {activeView === "drive" && <DashboardStats />}
              {activeView === "links" ? (
                <ActiveLinksList />
              ) : (
                <Mainright activeView={activeView} searchQuery={searchQuery}/>
              )}
            </div>

        </div>
     </div>
    </>
  );
}