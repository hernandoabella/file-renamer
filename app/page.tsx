"use client";

import { useState, useRef } from "react";
import JSZip from "jszip";
import { FaUpload, FaDownload, FaFile, FaTrash, FaCopy, FaMagic, FaImage, FaFileArchive, FaTimes } from "react-icons/fa";

export default function FileRenamerPro() {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState("photo");
  const [digits, setDigits] = useState(3);
  const [startNumber, setStartNumber] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    setFiles(prev => [...prev, ...arr]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const generateRenamedFiles = () => {
    return files.map((file, index) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const number = String(index + startNumber).padStart(digits, "0");
      const newName = `${prefix}${number}.${ext}`;
      const renamedFile = new File([file], newName, { type: file.type });
      return { old: file.name, new: newName, file: renamedFile, type: ext };
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
    a.download = `${prefix}_files.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyNewNames = () => {
    const names = renamed.map(item => item.new).join('\n');
    navigator.clipboard.writeText(names);
    alert('Names copied to clipboard!');
  };

  const getFileIcon = (type: string | undefined) => {
    if (!type) return <FaFile className="text-gray-400" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) {
      return <FaImage className="text-blue-400" />;
    }
    return <FaFile className="text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Main Container - Centered in the middle */}
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <FaMagic className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              File Renamer Pro
            </h1>
          </div>
          
          {files.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm"
            >
              <FaTimes />
              Clear All
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g., photo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Digits</label>
              <input
                type="number"
                value={digits}
                min={1}
                max={5}
                onChange={(e) => setDigits(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start #</label>
              <input
                type="number"
                value={startNumber}
                min={1}
                onChange={(e) => setStartNumber(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 ${
              isDragging 
                ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaUpload className="text-blue-500 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Drop files here
                </h3>
                <p className="text-gray-500 text-sm">or click to browse</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Files Preview */}
          {renamed.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {renamed.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getFileIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">
                        {item.old}
                      </p>
                      <p className="text-sm font-semibold text-green-600 truncate">
                        {item.new}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFile(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Remove file"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const url = URL.createObjectURL(item.file);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = item.new;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      title="Download single file"
                    >
                      <FaDownload className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {files.length > 0 && (
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
            <div className="text-sm text-gray-600">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={copyNewNames}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition text-sm"
              >
                <FaCopy />
                Copy Names
              </button>
              
              <button
                onClick={downloadAllAsZip}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
              >
                <FaFileArchive />
                Download ZIP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}