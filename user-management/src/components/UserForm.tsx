import { useState, useEffect } from "react";
import axios from "axios";
import type User from "./types/User_type";
import Navbar from "./Navbar";
import { useParams, useNavigate } from "react-router-dom";

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined && id !== null && id !== "";;

  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    name: "",
    email: "",
    company_name: ""
  });

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchUser = async () => {
        const res = await axios.get<User>(`http://localhost:5000/users/${id}`);
        setFormData({
          name: res.data.name,
          email: res.data.email,
          company_name: res.data.company_name
        });
      };
      fetchUser();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && id) {
        await axios.put(`http://localhost:5000/users/${id}`, formData);
        setMessage(" User updated successfully!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        await axios.post("http://localhost:5000/users", formData);
        setMessage(" User added successfully!");
        setFormData({
          name: "",
          email: "",
          company_name: ""
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} user:`, error);
      setMessage(`Failed to ${isEditMode ? 'update' : 'add'} user. Please try again.`);
      setTimeout(() => setMessage(null), 3000);
    }
  };
     
  return (
    <>
    <Navbar/>
    <div className='flex justify-center items-center min-h-screen text-white bg-linear-to-r from-purple-500 to-pink-500'>
      <form   onSubmit={handleSubmit} className="max-w-sm w-full bg-white p-6 rounded-lg border border-blue-700 shadow-xl">
        <h2 className="mb-5 flex justify-center items-center font-bold text-black">
          {isEditMode ? "UPDATE USER" : "ADD USER"}
        </h2>
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center ${
            message.includes("User added successfully!") || message.includes("User updated successfully!") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {message}
          </div>
        )}
        <div className="mb-5">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Name"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            onChange={handleChange}
            value={formData.email}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Email"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Company name
          </label>
          <input
            type="text"
            id="company_name"
            onChange={handleChange}
            value={formData.company_name}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Company name"
            required
          />
        </div>
        <button
          type="submit"
          className="text-white bg-linear-to-r from-purple-500 to-pink-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {isEditMode ? "Update User" : "Add User"}
        </button>
      </form>
    </div>
    </>
  );
};

export default UserForm;
