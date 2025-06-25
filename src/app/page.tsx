"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const SIMPLE_EXPRESSIONS: Record<string, string> = {
  "1+1": "Wow, that's some advanced math! 🤓",
  "2*2": "Genius! Did you need a calculator for that? 😏",
  "3-3": "Zero! You must be so proud. 🙃",
  "4/2": "Dividing by 2? Impressive. 😆",
  "5+0": "Adding zero, huh? Bold move. 😜",
  "6-0": "Subtracting nothing, classic. 😅",
  "0*7": "Multiplying by zero, risky! 😂",
  "8/1": "Dividing by one, next-level stuff. 😏",
  "9-9": "Another zero, you math wizard! 🧙‍♂️",
  "10/2": "You cracked the code! 🥸",
};

const VALID_KEYS = [
  ...Array.from({ length: 10 }, (_, i) => i.toString()),
  ".", "+", "-", "*", "/"
];

export default function Home() {
  const { data: session, status } = useSession();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | number>("");
  const [mockMsg, setMockMsg] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (VALID_KEYS.includes(e.key)) {
        setInput((prev) => prev + e.key);
      } else if (e.key === "Backspace") {
        setInput((prev) => prev.slice(0, -1));
      } else if (e.key === "Escape") {
        setInput("");
        setResult("");
      } else if (e.key === "Enter" || e.key === "=") {
        handleCalculate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [input, session]);

  const handleClick = (value: string) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput("");
    setResult("");
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const showMocking = (msg: string) => {
    setMockMsg(msg);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setMockMsg("");
    }, 2000);
  };

  const handleCalculate = () => {
    const trimmed = input.replace(/\s/g, "");
    if (SIMPLE_EXPRESSIONS[trimmed]) {
      showMocking(SIMPLE_EXPRESSIONS[trimmed]);
      // Show both mock and real answer
      try {
        // eslint-disable-next-line no-eval
        const evalResult = eval(trimmed.replace(/[^-+*/.\d]/g, ""));
        setResult(evalResult);
      } catch {
        setResult("Error");
      }
      return;
    }
    try {
      // eslint-disable-next-line no-eval
      const evalResult = eval(trimmed.replace(/[^-+*/.\d]/g, ""));
      setResult(evalResult);
    } catch {
      setResult("Error");
    }
  };

  const buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "+", "="]
  ];

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-700 dark:text-gray-200">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Sign in to use the calculator</div>
          <button
            onClick={() => signIn("google")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-lg font-semibold shadow"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Floating mocking message */}
      {mockMsg && (
        <div
          className="absolute top-24 animate-float-mock left-1/2 -translate-x-1/2 px-6 py-3 bg-pink-500 text-white text-lg rounded-xl shadow-lg pointer-events-none select-none z-50"
          style={{animation: 'float-mock 2s forwards'}}
        >
          {mockMsg}
        </div>
      )}
      <style>{`
        @keyframes float-mock {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.95); }
          10% { opacity: 1; transform: translate(-50%, -10px) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -40px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -60px) scale(1.05); }
        }
        .animate-float-mock {
          animation: float-mock 2s forwards;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-700 dark:text-gray-200 text-lg font-semibold">Welcome, {session.user?.name || session.user?.email}</div>
          <button
            onClick={() => signOut()}
            className="ml-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded text-sm font-medium"
          >
            Sign out
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={input}
            readOnly
            className="w-full text-right text-2xl p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2 outline-none"
          />
          <div className="text-right text-lg text-gray-500 min-h-[1.5rem] dark:text-gray-300">
            {result !== "" && <span>= {result}</span>}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-3">
          {buttons.flat().map((btn, idx) =>
            btn === "=" ? (
              <button
                key={idx}
                onClick={handleCalculate}
                className="col-span-1 bg-blue-500 hover:bg-blue-600 text-white rounded p-3 text-xl font-bold transition-colors"
              >
                =
              </button>
            ) : (
              <button
                key={idx}
                onClick={() => handleClick(btn)}
                className={`col-span-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 rounded p-3 text-xl font-medium transition-colors ${["/", "*", "-", "+"].includes(btn) ? "bg-orange-300 dark:bg-orange-600 hover:bg-orange-400 dark:hover:bg-orange-500 text-white" : ""}`}
              >
                {btn}
              </button>
            )
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 bg-red-400 hover:bg-red-500 text-white rounded p-2 font-semibold transition-colors"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded p-2 font-semibold transition-colors"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
