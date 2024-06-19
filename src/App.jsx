import CategoryMenu from "./components/CategoryMenu";
import FoodItems from "./components/FoodItems";
import FoodBag from "./components/FoodBag";
import Notification from "./components/Notification";
import io from "socket.io-client";
import { useContext, useEffect } from "react";

import { Context } from "./store/context";

const SOCKET = io(process.env.REACT_APP_SOCKET_SERVER);

function App() {
  const setSocketContext = useContext(Context).setSocket;
  const socketContext = useContext(Context).socket;

  useEffect(() => {
    SOCKET.on("connection_sucess", () => {
      setSocketContext(SOCKET);
    });
  }, [SOCKET]);

  return (
    <main className="flex bg-primary  h-screen">
      <div className="flex flex-col w-full lg:w-[70%]">
        <CategoryMenu />
        <FoodItems />
      </div>
      <FoodBag />
      {!SOCKET.connected && (
        <div className=" backdrop-blur-lg fixed bottom-0 z-50 w-full  bg-black/75 flex items-center justify-center">
          <span className="px-2 py-4 font-primary flex tracking-wide flex-row items-center gap-2 text-zinc-100 font-semibold text-lg">
            <span className="spinner"></span>
            Please wait for socket connection... (dev purpose only)
          </span>
        </div>
      )}
      <Notification />
    </main>
  );
}

export default App;
