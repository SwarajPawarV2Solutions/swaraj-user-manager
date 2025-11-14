import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import type User from "./types/User_type";
import { Button } from "flowbite-react";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<User[]>("http://localhost:5000/users")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching data");
        setLoading(false);
        console.error("Error fetching users:", err);
      });
  }, []);

  const updateUser = (id: string | number) => {
    navigate(`/update/${id}`);
  };

  const deleteUser = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm)
    );
  }, [users, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const goToAddUser = () => {
    navigate("/add");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            User List
          </h2>

          <div className="flex justify-end mb-4">
            <Button
              onClick={goToAddUser}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
            >
              Add User
            </Button>
          </div>

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} />

          {searchTerm && (
            <div className="text-center mb-4 text-gray-600 text-sm">
              Found {filteredUsers.length} user
              {filteredUsers.length !== 1 ? "s" : ""} matching "{searchTerm}"
            </div>
          )}

          {searchTerm && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                No users found matching your search.
              </p>
            </div>
          )}

          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-4">No users found. Please add a user.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-gray-50 shadow-md rounded-lg p-6 border border-gray-400 hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium text-gray-700">Company:</span>{" "}
                    {user.company_name}
                  </p>

                  <div className="flex justify-center space-x-3">
                    <Button
                      onClick={() => updateUser(user.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                    >
                      Update
                    </Button>
                    <Button
                      onClick={() => {
                        deleteUser(user.id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserList;
