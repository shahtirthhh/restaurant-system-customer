import React, { useContext, useEffect, useState } from "react";

import menu_open from "../assests/menu.png";
import menu_close from "../assests/menu_close.png";

import { Context } from "../store/context";

function CategoryMenu() {
  const setCategoryContext = useContext(Context).setCategory;
  const categoryContext = useContext(Context).category;

  const [isOpen, setIsOpen] = useState(false);

  const [categories, setCategories] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetch_categories = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        process.env.REACT_APP_REST_API + "/foods/categories"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData = await response.json();
      jsonData.categories.unshift({ category: "All", _id: -1 });
      setCategories(jsonData.categories);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch_categories();
  }, []);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const checkCategory = (active) =>
    active === categoryContext ? "text-neutral-700" : "";
  const checkCategoryLg = (active) =>
    active === categoryContext ? "text-zinc-500" : "text-zinc-200";
  return (
    <>
      <button
        className="fixed z-[50] bg-primary top-0 sm:hidden text-3xl mt-2 p-2  rounded-r-xl border  shadow-lg lg:hidden"
        onClick={toggleMenu}
      >
        <img src={menu_open} className="w-14 h-14" alt="" />
      </button>
      <nav className=" hidden sm:flex justify-center items-center m-2 rounded-xl shadow-xl p-2 bg-secondary ">
        {loading && <span className="spinner "></span>}
        {error && (
          <span className="text-red-400 font-bold font-primary text-lg">
            Error occured !
          </span>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          {categories &&
            categories.map((category) => (
              <button
                onClick={() => setCategoryContext(category.category)}
                key={category._id}
                className={`  text-lg font-bold font-primary px-4 text-neutral-500 whitespace-nowrap   transition-all text-center ${checkCategory(
                  category.category
                )}`}
              >
                {category.category}
              </button>
            ))}
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-md flex flex-col gap-5 justify-center items-center z-50 lg:hidden">
          {categories &&
            categories.map((category) => (
              <button
                onClick={() => {
                  setCategoryContext(category.category);
                  setIsOpen(false);
                }}
                key={category._id}
                className={`text-lg tracking-wider font-semibold font-primary  whitespace-nowrap   transition-all text-center ${checkCategoryLg(
                  category.category
                )}`}
              >
                {category.category}
              </button>
            ))}

          <button onClick={toggleMenu}>
            <img src={menu_close} className="z-[51] w-10  h-10" alt="" />
          </button>
        </div>
      )}
    </>
  );
}

export default CategoryMenu;
