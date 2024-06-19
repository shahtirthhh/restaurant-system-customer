// Modal.js
import React from "react";

const Modal = ({
  title,
  type,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4font-primary ">{title}</h2>
        <p className="mb-6 font-primary font-semibold text-neutral-600">
          {message}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="font-primary px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            {cancelText}
          </button>
          <button
            disabled={type === "loading"}
            onClick={onConfirm}
            className={`flex flex-row gap-2 items-center font-primary px-4 py-2 ${
              type === "delete"
                ? "bg-red-600 text-white  hover:bg-red-700"
                : type === "loading"
                ? "disabled:bg-neutral-500 text-white "
                : "bg-green-500 text-white hover:bg-green-700"
            } rounded`}
          >
            {type === "loading" ? (
              <>
                <span className="spinner"></span>{" "}
                <span className="text-white font-semibold font-primary">
                  Placing order...
                </span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
