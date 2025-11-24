"use client";

import { useState } from "react";
import JSZip from "jszip";


export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState("file");
  const [digits, setDigits] = useState(3); // number padding (e.g. 3 = 001)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    setFiles(arr);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const generateRenamedFiles = () => {
    return files.map((file, index) => {
      const ext = file.name.split(".").pop();
      const number = String(index + 1).padStart(digits, "0");
      const newName = `${prefix}${number}.${ext}`;

      const renamedFile = new File([file], newName, { type: file.type });
      return { old: file.name, new: newName, file: renamedFile };
    });
  };

  const renamed = generateRenamedFiles();

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    renamed.forEach((item) => {
      zip.file(item.new, item.file);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "renamed_files.zip";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <div className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">🔁 File Renamer Tool</h1>

      {/* Controls */}
      <div className="bg-white p-5 rounded-xl shadow mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="border px-3 py-2 rounded w-32"
            placeholder="Prefix"
          />

          <input
            type="number"
            value={digits}
            min={1}
            max={5}
            onChange={(e) => setDigits(Number(e.target.value))}
            className="border px-3 py-2 rounded w-24"
            placeholder="Digits"
          />
        </div>

        <input
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="mb-4"
        />

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="p-6 border-2 border-dashed rounded-lg text-center text-gray-600 cursor-pointer"
        >
          Drag & drop files here
        </div>
      </div>

      {/* Preview */}
      {renamed.length > 0 && (
        <>
          <div className="mb-4">
            <button
              onClick={downloadAllAsZip}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow"
            >
              Download All (ZIP)
            </button>
          </div>

          <div className="space-y-3">
            {renamed.map((item, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-xl shadow flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">Old: {item.old}</p>
                  <p className="text-green-600">New: {item.new}</p>
                </div>

                <button
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => {
                    const url = URL.createObjectURL(item.file);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = item.new;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    </main>
  );
}