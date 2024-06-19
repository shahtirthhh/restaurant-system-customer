import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/context";

import empty_bag from "../assests/bag.png";
import delete_static from "../assests/delete_static.png";
import plus from "../assests/plus.png";
import minus from "../assests/minus.png";

import bag from "../assests/food-bag.png";
import menu_close from "../assests/menu_close.png";
import hungry from "../assests/hungry.jpg";
import another_order from "../assests/another_order.jpg";

import Modal from "../components/Modal";

function FoodBag() {
  const foodBagContext = useContext(Context).foodBag;
  const updateFoodBagContext = useContext(Context).updateFoodBag;
  const socketContext = useContext(Context).socket;
  const setNotificationContext = useContext(Context).setNotification;

  const { remove_item_from_bag, update_item_in_bag } = useContext(Context);

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("confirm");
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [tableNumber, setTableNumber] = useState(undefined);

  const [myOrders, setMyOrders] = useState(
    JSON.parse(localStorage.getItem("orders"))?.filter((order) => {
      return !(order.canceled || (order.payment_done && order.served));
    })
  );

  const ask_for_table_number = () => {
    let num = null;
    do {
      num = window.prompt("Please enter the table number");
      if (isNaN(parseInt(num))) window.alert("Enter a valid table number  ");
    } while (isNaN(parseInt(num)));
    setTableNumber(num);
    localStorage.setItem("table-number", num);
  };
  useEffect(() => {
    if (localStorage.getItem("table-number")) {
      setTableNumber(localStorage.getItem("table-number"));
    } else {
      ask_for_table_number();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!myOrders || myOrders?.length < 1) {
      ask_for_table_number();
    }
    localStorage.setItem("orders", JSON.stringify(myOrders));
  }, [myOrders]);

  useEffect(() => {
    const handleOrderPayment = (_id) => {
      const foundOrder = myOrders.find((order) => order._id === _id);
      if (foundOrder) {
        setNotificationContext({
          visible: true,
          color: "green",
          data: `Payment for order number: ${_id} has been done!`,
        });
        const updatedOrders = myOrders.map((order) =>
          order._id === _id ? { ...order, payment_done: true } : order
        );
        setMyOrders(updatedOrders);
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
      }
    };

    const handleOrderCancellation = (_id) => {
      const foundOrder = myOrders.find((order) => order._id === _id);
      if (foundOrder) {
        setNotificationContext({
          visible: true,
          color: "red",
          data: `Order number: ${_id} has been canceled!`,
        });

        const updatedOrders = myOrders.map((order) =>
          order._id === _id ? { ...order, canceled: true } : order
        );
        setMyOrders(updatedOrders);
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
      }
    };
    const handleOrderServed = (_id) => {
      const foundOrder = myOrders.find((order) => order._id === _id);
      if (foundOrder) {
        setNotificationContext({
          visible: true,
          color: "green",
          data: "Wohooo ! Order is on its way...🥰",
        });

        const updatedOrders = myOrders.map((order) =>
          order._id === _id ? { ...order, served: true } : order
        );
        setMyOrders(updatedOrders);
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
      }
    };

    socketContext?.on("check_for_order_payment", handleOrderPayment);
    socketContext?.on("check_for_order_cancellation", handleOrderCancellation);
    socketContext?.on("check_for_order_served", handleOrderServed);

    return () => {
      socketContext?.off("check_for_order_payment", handleOrderPayment);
      socketContext?.off(
        "check_for_order_cancellation",
        handleOrderCancellation
      );
      socketContext?.off("check_for_order_served", handleOrderServed);
    };
  }, [socketContext, myOrders, setNotificationContext]);

  const place_order = async () => {
    // socketContext.emit("new_order");
    if (foodBagContext.items.length < 1) return;
    setModalType("loading");
    try {
      const response = await fetch(
        process.env.REACT_APP_REST_API + "/orders/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...foodBagContext, tableNumber }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const jsonData = await response.json();
      if (jsonData.placed) {
        updateFoodBagContext({ items: [], total: 0 });
        setNotificationContext({
          visible: true,
          color: "green",
          data: "🍔 Your order will be with you soon !",
        });
        socketContext.emit("new_order");
        setMyOrders((prevOrders) => [...prevOrders, jsonData.placed_order]);
        setIsModalOpen(false);
        setModalType("confirm");
      } else {
        setNotificationContext({
          visible: true,
          color: "red",
          data: jsonData.message,
        });
      }
    } catch (error) {
      setNotificationContext({
        visible: true,
        color: "red",
        data: "Order failed !",
      });
    }
  };

  let grand_total = Number(0);
  let grand_total_mobile = Number(0);

  return (
    <>
      <button
        className="fixed z-[50] bg-primary bottom-8 right-0 lg:hidden text-3xl mt-2 p-2  rounded-l-xl border  shadow-lg "
        onClick={toggleMenu}
      >
        <img src={bag} className="w-14 h-14" alt="" />
      </button>

      <div className="lg:flex flex-col hidden justify-start items-center lg:w-[30%]  bg-secondary m-2 shadow-xl rounded-xl overflow-y-auto custom_scrollbar">
        <h1 className="text-4xl text-center text-neutral-700 font-primary font-bold p-2 w-full ">
          TABLE : {tableNumber}
        </h1>

        {foodBagContext.items.length < 1 && (
          <div
            className={`${
              myOrders.length > 0 ? "mt-5" : "mt-32"
            } flex flex-col gap-5 items-center p-3`}
          >
            <img
              className="w-48 h-48"
              src={myOrders.length > 0 ? another_order : empty_bag}
              alt="empty"
            />
            <span className="font-primary text-center font-semibold text-xl text-neutral-600">
              {myOrders.length > 0
                ? "What about another order ?"
                : "What about adding some items ?"}
            </span>
          </div>
        )}
        <table className="min-w-full mt-4 border-t-2 border-neutral-600 bg-white border-collapse">
          <tbody>
            {foodBagContext.items.map((item) => (
              <tr
                key={item._id}
                className="border-b flex justify-between items-center p-2"
              >
                <img
                  src={plus}
                  alt="add"
                  className="hover:scale-[1.05] w-8 h-8 hover:cursor-pointer"
                  onClick={() => update_item_in_bag(item._id, "increment")}
                />

                <td className="w-[30%] font-primary text-neutral-700 text-lg font-semibold">
                  {item.name}
                </td>
                <td className=" font-primary text-neutral-700 text-lg text-center">
                  x{item.quantity}
                </td>
                <td className=" font-primary text-neutral-700 text-lg text-center">
                  ${item.gross}
                </td>
                <td className=" font-primary text-neutral-700 text-lg text-center space-x-2">
                  <div className="flex items-center">
                    <img
                      src={minus}
                      alt="minus"
                      className="hover:scale-[1.05] w-8 h-8 hover:cursor-pointer"
                      onClick={() => update_item_in_bag(item._id, "decrement")}
                    />
                    <img
                      src={delete_static}
                      alt="delete"
                      className="hover:scale-[1.05] w-8 h-8 hover:cursor-pointer"
                      onClick={() => remove_item_from_bag(item._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!foodBagContext.items.length < 1 && (
          <h3 className="font-primary font-semibold text-neutral-700 text-xl mt-5">
            💵 Total: ${foodBagContext.total}
          </h3>
        )}
        {foodBagContext.items.length > 0 && (
          <div className="px-4 flex flex-wrap-reverse gap-3 mt-3 justify-center items-center">
            <img
              src={hungry}
              className="xl:w-64 w-52  xl:h-64 h-52 "
              alt="hungry"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className=" bg-sky-300 hover:bg-sky-500 mt-10 rounded-xl font-primary font-semibold text-neutral-600 text-xl transition-all px-4 py-1"
            >
              Place order
            </button>
          </div>
        )}
        {localStorage.getItem("orders") && (
          <table className="relative p-2 min-w-full mt-4 bg-white ">
            <tbody>
              {" "}
              {JSON.parse(localStorage.getItem("orders")).map((order) => {
                grand_total += order.total;

                return (
                  <>
                    <div
                      key={order._id}
                      className="border-t-2 border-neutral-500 mt-7 flex justify-between gap-3 p-2 border-b "
                    >
                      <span className="font-primary text-neutral-700 text-lg text-center">
                        Order no: {order._id}
                      </span>
                      <span className="font-primary text-neutral-700 text-lg text-center">
                        Amount: ${order.total}
                      </span>
                      {order.canceled && (
                        <span className="font-primary text-red-500 font-semibold text-lg text-center">
                          Order canceled
                        </span>
                      )}
                      {order.payment_done && (
                        <span className="font-primary text-green-500 font-semibold text-lg text-center">
                          Paid !
                        </span>
                      )}
                      {order.served && (
                        <span className="font-primary text-yellow-600 font-semibold text-lg text-center">
                          Served !
                        </span>
                      )}
                    </div>
                    {!order.canceled ||
                      (!order.served &&
                        order.items.map((item) => (
                          <tr
                            key={item._id}
                            className=" flex justify-between items-center p-2"
                          >
                            <td className="w-[30%] font-primary text-neutral-700 text-lg font-semibold">
                              {item.name}
                            </td>
                            <td className=" font-primary text-neutral-700 text-lg text-center">
                              x{item.quantity}
                            </td>
                          </tr>
                        )))}
                  </>
                );
              })}
              {grand_total > 0 && (
                <span className="absolute top-0  font-primary text-neutral-700 text-xl font-bold tracking-wide text-center">
                  💵 Grand Total: ${grand_total}
                </span>
              )}
            </tbody>
          </table>
        )}
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-85 backdrop-blur-md flex flex-col gap-5 justify-center items-center z-50 lg:hidden overflow-y-auto">
          <h1 className="text-4xl text-center text-zinc-300 font-primary font-bold p-2 w-full ">
            TABLE : {tableNumber}
          </h1>
          {foodBagContext.items.length < 1 && (
            <div
              className={`${
                myOrders.length > 0 ? "mt-5" : "mt-32"
              } flex flex-col gap-5 items-center p-3`}
            >
              <img
                className={`w-48 h-48 ${
                  myOrders.length > 0 ? "hidden" : "block"
                }`}
                src={myOrders.length > 0 ? another_order : empty_bag}
                alt="empty"
              />
              <span className="font-primary text-center font-semibold text-3xl tracking-wide text-zinc-100">
                {myOrders.length > 0
                  ? "What about another order ?"
                  : "What about adding some items ?"}
              </span>
            </div>
          )}
          {localStorage.getItem("orders") && (
            <table className="relative p-2 min-w-full mt-4">
              <tbody className="flex justify-center flex-col gap-3">
                {" "}
                {JSON.parse(localStorage.getItem("orders")).map((order) => {
                  grand_total_mobile += order.total;

                  return (
                    <>
                      <div
                        key={order._id}
                        className="border-t-2 border-neutral-500 bg-white/70 mt-7 flex justify-between gap-3 p-2 border-b "
                      >
                        <span className="font-primary text-neutral-800 text-lg text-center">
                          Order no: {order._id}
                        </span>
                        <span className="font-primary text-neutral-800 text-lg text-center">
                          Amount: ${order.total}
                        </span>
                        {order.payment_done && (
                          <span className="font-primary font-bold text-green-800 text-lg text-center">
                            Paid !
                          </span>
                        )}
                        {order.served && (
                          <span className="font-primary text-yellow-600 font-semibold text-lg text-center">
                            Served !
                          </span>
                        )}
                        {order.canceled && (
                          <span className="font-primary font-bold text-red-800 text-lg text-center">
                            Canceled !
                          </span>
                        )}
                      </div>
                      {!order.canceled &&
                        order.items.map((item) => (
                          <tr
                            key={item._id}
                            className=" flex justify-between items-center p-2  "
                          >
                            <td className="w-[30%] font-primary text-zinc-300 text-lg font-semibold">
                              {item.name}
                            </td>
                            <td className=" font-primary text-zinc-300 text-lg text-center">
                              x{item.quantity}
                            </td>
                          </tr>
                        ))}
                    </>
                  );
                })}
                {grand_total_mobile > 0 && (
                  <span className="w-full font-primary text-sky-400 text-3xl font-bold tracking-wide text-center">
                    💵 Grand Total: ${grand_total_mobile.toFixed(1)}
                  </span>
                )}
              </tbody>
            </table>
          )}
          <table className="min-w-full mt-4 ">
            <tbody>
              {foodBagContext.items.map((item) => (
                <tr
                  key={item._id}
                  className=" flex justify-between items-center p-2"
                >
                  <div className="flex gap-2 items-center">
                    <img
                      src={plus}
                      alt="add"
                      className="hover:scale-[1.05] w-8 h-8 hover:cursor-pointer"
                      onClick={() => update_item_in_bag(item._id, "increment")}
                    />
                    <img
                      src={minus}
                      alt="minus"
                      className="hover:scale-[1.05] w-8 h-8 hover:cursor-pointer"
                      onClick={() => update_item_in_bag(item._id, "decrement")}
                    />
                  </div>
                  <td className="w-[30%] font-primary text-zinc-50 text-lg font-semibold">
                    {item.name}
                  </td>
                  <td className=" font-primary text-zinc-50 text-lg text-center">
                    x{item.quantity}
                  </td>
                  <td className=" font-primary text-zinc-50 text-lg text-center">
                    ${item.gross}
                  </td>
                  <td className=" font-primary text-zinc-50 text-lg text-center space-x-2">
                    <img
                      src={delete_static}
                      alt="delete"
                      className="hover:scale-[1.05] w-8 h-8 hover:cursor-pointer"
                      onClick={() => remove_item_from_bag(item._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!foodBagContext.items.length < 1 && (
            <h3 className="font-primary font-semibold text-zinc-50 text-xl mt-5">
              💵 Total: ${foodBagContext.total}
            </h3>
          )}
          {foodBagContext.items.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className=" bg-sky-300 hover:bg-sky-500 my-10 rounded-xl font-primary font-semibold text-neutral-600 text-xl transition-all px-4 py-1"
            >
              Place order
            </button>
          )}
          <button onClick={toggleMenu}>
            <img src={menu_close} className="z-[51] w-14  h-14" alt="" />
          </button>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        type={modalType}
        title="Confirm order ?"
        message="Are you sure to place the order"
        confirmText="🍕 Yes"
        cancelText="Cancel"
        onConfirm={place_order}
        onCancel={handleCancel}
      />
    </>
  );
}

export default FoodBag;
