"use client";

import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import "./globals.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  date: string;
}

interface Category {
  id: string;
  name: string;
  todos: Todo[];
}

export default function TodoApp() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [input, setInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("categories");
    const theme = localStorage.getItem("darkMode");
    if (stored) setCategories(JSON.parse(stored));
    if (theme !== null) {
      setDarkMode(JSON.parse(theme));
    } else {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const currentCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const filteredTodos = currentCategory?.todos.filter(todo =>
    todo.text.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const addCategory = () => {
    const name = prompt("Nama kategori baru:");
    if (name) {
      const id = Date.now().toString();
      setCategories([...categories, { id, name, todos: [] }]);
      setSelectedCategoryId(id);
    }
  };

  const addOrUpdateTodo = () => {
    if (!input.trim() || !dateInput.trim() || !selectedCategoryId) return;

    const updated = categories.map((cat) => {
      if (cat.id === selectedCategoryId) {
        const updatedTodos = editingId
          ? cat.todos.map((todo) =>
              todo.id === editingId ? { ...todo, text: input, date: dateInput } : todo
            )
          : [...cat.todos, { id: Date.now(), text: input, completed: false, date: dateInput }];
        return { ...cat, todos: updatedTodos };
      }
      return cat;
    });

    setCategories(updated);
    setInput("");
    setDateInput("");
    setEditingId(null);
  };

  const deleteTodo = (id: number) => {
    const updated = categories.map(cat =>
      cat.id === selectedCategoryId
        ? { ...cat, todos: cat.todos.filter(todo => todo.id !== id) }
        : cat
    );
    setCategories(updated);
  };

  const toggleComplete = (id: number) => {
    const updated = categories.map(cat =>
      cat.id === selectedCategoryId
        ? {
            ...cat,
            todos: cat.todos.map(todo =>
              todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
          }
        : cat
    );
    setCategories(updated);
  };

  const startEdit = (todo: Todo) => {
    setInput(todo.text);
    setDateInput(todo.date);
    setEditingId(todo.id);
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid md:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">📁 Kategori</h2>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`cursor-pointer p-2 rounded ${
                  cat.id === selectedCategoryId ? "bg-blue-100 dark:bg-blue-800 font-bold" : ""
                }`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </li>
            ))}
          </ul>
          <button onClick={addCategory} className="mt-4 text-blue-600 text-sm">+ Tambah Kategori</button>
        </aside>

        {/* Main Content */}
        <section className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow w-full">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">📝 Todo List</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-zinc-200 dark:bg-zinc-700 px-4 py-2 rounded text-sm"
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <input
              className="p-3 rounded border dark:bg-zinc-700"
              placeholder="Tugas..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <input
              type="date"
              className="p-3 rounded border dark:bg-zinc-700"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            <button
              onClick={addOrUpdateTodo}
              className="md:col-span-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded"
            >
              {editingId ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>

          <div className="flex items-center bg-white dark:bg-zinc-700 px-4 py-2 rounded-md mb-4">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              className="w-full bg-transparent outline-none text-black dark:text-white"
              placeholder="Cari tugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ul className="space-y-3">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl flex justify-between items-center"
              >
                <div onClick={() => toggleComplete(todo.id)} className="cursor-pointer">
                  <p className={`text-lg font-medium ${todo.completed ? "line-through text-gray-400" : ""}`}>
                    {todo.text}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{todo.date}</p>
                </div>
                <div className="flex gap-2 text-xl">
                  <button onClick={() => startEdit(todo)} className="text-yellow-500 hover:text-yellow-600">✏️</button>
                  <button onClick={() => deleteTodo(todo.id)} className="text-red-500 hover:text-red-600">❌</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
