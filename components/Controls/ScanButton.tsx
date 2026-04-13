"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSequenceStore } from "@/lib/stores/useSequenceStore";
import { BLOCK_LIBRARY } from "@/lib/blockLibrary";

export default function ScanButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('["motif_01", "rhythm_01", "motif_02"]');
  const [error, setError] = useState<string | null>(null);

  const { injectExternalSequence } = useSequenceStore();

  const handleSubmit = () => {
    setError(null);

    try {
      const parsed = JSON.parse(inputValue);

      if (!Array.isArray(parsed)) {
        setError("Input must be a JSON array");
        return;
      }

      if (!parsed.every((item) => typeof item === "string")) {
        setError("All array items must be strings");
        return;
      }

      // Validate block IDs
      const invalidIds = parsed.filter((id) => !BLOCK_LIBRARY[id]);
      if (invalidIds.length > 0) {
        setError(`Unknown block IDs: ${invalidIds.join(", ")}`);
        return;
      }

      injectExternalSequence(parsed);
      setIsModalOpen(false);
    } catch {
      setError("Invalid JSON format");
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="px-4 h-10 rounded-lg flex items-center gap-2
          bg-blue-600 hover:bg-blue-500 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
          />
        </svg>
        Scan
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Inject Sequence</h2>
              <p className="text-slate-400 text-sm mb-4">
                Enter a JSON array of block IDs to inject into the timeline.
                This simulates QR code scanning for testing.
              </p>

              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-1 block">
                  Available block IDs:
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(BLOCK_LIBRARY).map((id) => (
                    <code
                      key={id}
                      className="px-2 py-1 bg-slate-700 rounded text-xs"
                    >
                      {id}
                    </code>
                  ))}
                </div>
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-24 bg-slate-700 text-white rounded-lg p-3 font-mono text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='["motif_01", "rhythm_01"]'
              />

              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Inject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
