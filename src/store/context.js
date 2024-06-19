import React, { useState } from "react";

export const Context = React.createContext({
  socket: null,
  setSocket: (socket) => {},

  notification: { color: null, data: null },
  setNotification: ({ visible, color, data, loading = false }) => {},

  category: "All",
  setCategory: () => {},

  foodBag: { items: [], total: 0 },
  updateFoodBag: (items, total) => {},
  add_to_bag: (_id, name, price) => {},
  update_item_in_bag: (_id, operation) => {},
  remove_item_from_bag: (_id) => {},
});
// eslint-disable-next-line
export default (props) => {
  const [socketValue, setSocketValue] = useState(null);

  const [notificationValue, setNotificationValue] = useState({
    color: "null",
    data: "null",
    visible: false,
    loading: false,
  });

  const [categoryValue, setCategoryValue] = useState("All");

  const [foodBagValue, setFoodBagValue] = useState({
    items: [],
    total: 0,
  });

  const add_to_bag = (_id, name, price) => {
    setFoodBagValue((prevState) => ({
      items: [
        ...prevState.items,
        {
          _id,
          name,
          price: parseFloat(price),
          quantity: 1,
          gross: parseFloat(price),
        },
      ],
      total: Number((prevState.total + parseFloat(price)).toFixed(1)),
    }));
  };
  const update_item_in_bag = (_id, operation) => {
    setFoodBagValue((prevState) => {
      const updatedItems = prevState.items
        .map((item) => {
          if (item._id === _id) {
            if (operation === "increment") {
              item.quantity += 1;
            } else if (operation === "decrement") {
              item.quantity -= 1;
            }
            item.gross = Number((item.quantity * item.price).toFixed(1));
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Filter out items with quantity 0

      // Calculate the new total
      const newTotal = Number(
        updatedItems.reduce((acc, item) => acc + item.gross, 0).toFixed(1)
      );

      return {
        items: updatedItems,
        total: newTotal,
      };
    });
  };
  const remove_item_from_bag = (_id) => {
    setFoodBagValue((prevState) => {
      const updatedItems = prevState.items.filter((item) => item._id !== _id);

      const newTotal = Number(
        updatedItems.reduce((acc, item) => acc + item.gross, 0).toFixed(1)
      );

      return {
        items: updatedItems,
        total: newTotal,
      };
    });
  };
  return (
    <Context.Provider
      value={{
        socket: socketValue,
        notification: notificationValue,
        category: categoryValue,
        foodBag: foodBagValue,

        setSocket: setSocketValue,
        setNotification: setNotificationValue,
        setCategory: setCategoryValue,

        updateFoodBag: setFoodBagValue,
        add_to_bag,
        update_item_in_bag,
        remove_item_from_bag,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};
