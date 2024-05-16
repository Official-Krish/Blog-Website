import { useState } from "react";
import { Avatar } from "./BlogCard";
import { Link, useNavigate } from "react-router-dom";


interface AppbarProps {
  skipAuthCheck?: boolean;
}

export const Appbar = ({ skipAuthCheck = false }: AppbarProps) => {
  const navigate = useNavigate();
  const isUserLoggedIn = localStorage.getItem("token");
  if (!isUserLoggedIn && skipAuthCheck == false) {
    navigate("/signin");
  }
  return (
    <div className="border-b border-slate-100 flex justify-between items-center p-4 md:px-16">
      <Link to="/" className="text-xl font-bold">
        Medium
      </Link>
      {isUserLoggedIn ? (
        <div className="flex gap-4 md:gap-8">
          <Link to="/publish">
                <button className="mt-2.5 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                    New
                </button>
            </Link>
          <ProfileBox />
        </div>
      ) : (
        <Link
          to="/signin"
          className="focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mx-12"
        >
          Sign In
        </Link>
      )}
    </div>
  );
};

function ProfileBox() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const nameAvatar = localStorage.getItem("emailForSignIn")

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };


  return (
    <div className="relative cursor-pointer mt-2.5">
      <Avatar name={nameAvatar} onClick={() => setShow(!show)} />
      {show && (
        <div className="absolute -bottom-24 -left-16 shadow-lg p-4 bg-gray-50 border border-gray-100 z-50 w-[160px]">
          <div className="flex flex-col gap-3 px-4 py-2">
            <div onClick={logout}>Logout</div>
          </div>
          <div className="flex flex-col gap-3 px-4 py-2">
            <div onClick={()=>{
                        window.open("https://github.com/Official-Krish", '_blank', 'noopener,noreferrer');
                    }}>Developer</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appbar;