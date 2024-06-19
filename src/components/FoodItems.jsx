import React, { useContext, useEffect, useState } from "react";

import burger_loading from "../assests/burger_loading.gif";

import add_sign from "../assests/add_sign.png";
import added from "../assests/added.png";

import empty_box from "../assests/empty_box.png";

import { Context } from "../store/context";

function FoodItems() {
  const categoryContext = useContext(Context).category;

  const addItemContext = useContext(Context).add_to_bag;
  const foodBagContext = useContext(Context).foodBag;
  // const setNotificationContext = useContext(Context).setNotification;

  const [foodItems, setFoodItems] = useState(undefined);
  const [filteredFoodItems, setFilteredFoodItems] = useState(foodItems);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");

  const filterItems = () => {
    if (filteredFoodItems) {
      if (search.length === 0) {
        const temp = foodItems.filter((item) =>
          categoryContext === "All" ? true : item.category === categoryContext
        );
        setFilteredFoodItems(temp);
      } else {
        const temp = foodItems.filter((item) =>
          search.length >= 1
            ? item.name.toLowerCase().includes(search.toLowerCase())
            : true && item.category === categoryContext
        );
        setFilteredFoodItems(temp);
      }
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(filterItems, [search, categoryContext]);

  const fetch_food_items = async () => {
    setLoading(true);
    try {
      const response = await fetch(process.env.REACT_APP_REST_API + "/foods");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData = await response.json();
      setFoodItems(jsonData.foodItems);
      setFilteredFoodItems(jsonData.foodItems);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch_food_items();
  }, []);

  return (
    <>
      <div className="flex justify-evenly items-center ">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Find item here..."
          className="m-2 sm:mx-2 w-52 shadow-md rounded-lg border p-1 text-neutral-600 font-primary focus:shadow-lg"
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="sm:block hidden font-primary font-medium text-neutral-600">
          Just few selections, and your hunger solution will be there... 😋
        </span>
      </div>
      <div className="rounded-xl flex flex-wrap overflow-y-auto custom_scrollbar gap-5 justify-evenly items-center shadow-xl p-5 m-2 bg-secondary h-full">
        {loading && (
          <div className="flex justify-center flex-col items-center">
            <img className="w-24 h-24" src={burger_loading} alt="loading" />
            <span className="font-primary text-neutral-500 font-semibold tracking-wide">
              Getting your hunger solution ...
            </span>
          </div>
        )}
        {filteredFoodItems &&
          filteredFoodItems.map((foodItem) => {
            return (
              <div
                key={foodItem._id}
                className="flex flex-col items-center gap-5 w-[21rem] rounded-xl shadow-md p-4 onView snap-center"
              >
                {/* Food image */}
                <div className="relative rounded-md bg-cover overflow-hidden sm:w-[20rem] w-full shadow-lg sm:h-[15rem] h-[15rem]">
                  <img
                    className="absolute z-10 w-full h-full object-cover"
                    src={
                      process.env.REACT_APP_REST_API +
                      `/food-images/${foodItem.image}`
                    }
                    alt={foodItem.name}
                  />
                </div>
                <div className="flex justify-between w-full gap-4 items-center">
                  <h1 className="w-full font-primary text-3xl text-primary_font font-bold">
                    {foodItem.name}
                  </h1>
                  <div className="flex gap-5 px-3">
                    {foodBagContext.items.find(
                      (item) => item._id === foodItem._id
                    ) ? (
                      <img className="w-10 h-8 " src={added} alt="added" />
                    ) : (
                      <img
                        onClick={() => {
                          addItemContext(
                            foodItem._id,
                            foodItem.name,
                            foodItem.price
                          );
                        }}
                        className="w-10 h-8 hover:scale-[1.1] hover:cursor-pointer transition-all"
                        src={add_sign}
                        alt="add"
                      />
                    )}
                  </div>
                </div>
                <div className="w-full gap-3 flex justify-between">
                  <h1 className="font-primary text-2xl text-primary_font font-normal">
                    {foodItem.category}
                  </h1>

                  <h1 className="font-primary text-xl text-primary_font font-normal">
                    ${foodItem.price}
                  </h1>
                </div>
              </div>
            );
          })}
        {filteredFoodItems && filteredFoodItems.length < 1 && (
          <div className="onView flex flex-col justify-center items-center gap-7 snap-center">
            <img src={empty_box} alt="noFood" className="w-24 h-24" />
            <h4 className="whitespace-pre-line text-center text-xl font-bold font-primary text-primary_font">
              {"😧 Ahh ohh... \nGot nothing here for now !"}
            </h4>
          </div>
        )}
      </div>{" "}
    </>
  );
}

export default FoodItems;
