import { Context } from "../store/context";
import React, { useContext, useEffect } from "react";

import spinner_done from "../assests/spinner_done.gif";
import spinner_error from "../assests/spinner_error.gif";

export default function Notification() {
  const { notification, setNotification } = useContext(Context);

  useEffect(() => {
    let timeout;
    if (!notification.loading && notification.visible) {
      timeout = setTimeout(() => {
        setNotification({
          ...notification,
          visible: false,
        });
      }, 10000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [notification, setNotification]);

  return (
    <div
      className={`z-[51] border-2 ${
        notification.color === "red"
          ? "border-red-500 shadow-red-400"
          : notification.color === "blue"
          ? "border-blue-500 shadow-sky-400"
          : notification.color === "green"
          ? "border-green-500 shadow-green-400"
          : "border-yellow-400 shadow-yellow-200"
      } rounded-2xl bg-white absolute top-[10%] md:top-[5%] duration-700 ease-in-out flex z-20  ${
        notification.visible
          ? "left-[1%]  opacity-100 notification_bounce"
          : "left-[-20%]  opacity-0"
      } px-8 justify-center md:w-auto w-[95%] shadow-md py-2 items-center gap-4`}
    >
      {notification.color === "blue" ? (
        <>
          <span className="spinner"></span>
          <h2 className="m-3 text-lg font-primary font-bold text-blue-600">
            {notification.data}
          </h2>
        </>
      ) : notification.color === "green" ? (
        <>
          <img className="w-14 h-14" src={spinner_done} alt="spinner" />
          <h2 className="text-lg font-primary font-bold text-green-600">
            {notification.data}
          </h2>
        </>
      ) : notification.color === "red" ? (
        <>
          <img className="w-14 h-14" src={spinner_error} alt="spinner" />
          <h2 className="text-lg font-primary font-bold text-red-600">
            {notification.data}
          </h2>
        </>
      ) : (
        <>
          <h2 className="m-3 text-lg font-primary font-bold text-yellow-600 ">
            {notification.data}
          </h2>
        </>
      )}
    </div>
  );
}
