'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Save username and photo in localStorage
    localStorage.setItem('chatUsername', name.trim());
    localStorage.setItem(
      'chatUserPhoto',
      photo.trim() || '/default-profile.png' // default image if none
    );

    router.push('/chat');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-4"
        onSubmit={handleLogin}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Enter profile photo URL (optional)"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}
