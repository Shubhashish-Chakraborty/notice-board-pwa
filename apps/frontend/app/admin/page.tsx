'use client';
import { useState } from 'react';

export default function AdminPage() {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('');

    const handleSend = async () => {
        setStatus('Sending...');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            });

            if (res.ok) {
                setStatus('Sent & Saved to DB!');
                setText('');
            } else {
                setStatus('Error sending');
            }
        } catch (err) {
            console.error(err);
            setStatus('Failed to connect to server');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-xl font-bold mb-4">Admin Push Console</h1>

                <textarea
                    className="w-full p-2 border border-gray-300 rounded mb-4 h-32 text-gray-800"
                    placeholder="Type message here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <button
                    onClick={handleSend}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Submit & Broadcast
                </button>

                {status && <p className="mt-4 text-center text-sm font-medium">{status}</p>}
            </div>
        </div>
    );
}