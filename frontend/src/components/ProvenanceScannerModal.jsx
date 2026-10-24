import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decodeArtworkDNA } from '../utils/steganography';
import { toast } from 'react-hot-toast';

const ProvenanceScannerModal = ({ onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG recommended)');
      return;
    }

    setScanning(true);
    setResult(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.src = objectUrl;

    img.onload = () => {
      const decoded = decodeArtworkDNA(img);
      setScanning(false);
      setResult(decoded);
      if (decoded.verified) {
        toast.success('Authentic Aura Cryptographic DNA Found! 🛡️');
      } else {
        toast('No Aura Steganography signature found in image.', { icon: 'ℹ️' });
      }
    };

    img.onerror = () => {
      setScanning(false);
      toast.error('Failed to load image for scanning');
    };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  🛡️ Steganographic Verifier
                </span>
                <span className="text-xs text-slate-400">LSB Pixel Bitstream Extraction</span>
              </div>
              <h3 className="mt-1 text-xl font-bold text-white">Artwork Provenance Scanner</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-5 space-y-5">
            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-8 text-center transition hover:border-cyan-500/60 hover:bg-slate-950/80"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-2xl shadow-inner transition group-hover:scale-110">
                🧬
              </div>

              <h4 className="mt-3 text-sm font-semibold text-white group-hover:text-cyan-300">
                Drop any artwork PNG to inspect authenticity
              </h4>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Extracts hidden cryptographic proof-of-authorship and prompt recipes invisibly encoded in the image pixels.
              </p>

              <span className="mt-4 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-[11px] font-semibold text-slate-300 transition group-hover:border-cyan-500/40 group-hover:text-white">
                Choose Image File
              </span>
            </div>

            {/* Selected Image Thumbnail */}
            {previewUrl && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                <img
                  src={previewUrl}
                  alt="Scanned artwork"
                  className="h-14 w-14 rounded-xl object-cover shadow"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">Scanned Image Stream</p>
                  <p className="text-[11px] text-slate-400">Analyzing LSB bitstream in canvas buffer...</p>
                </div>
              </div>
            )}

            {/* Scanning Indicator */}
            {scanning && (
              <div className="flex items-center justify-center space-x-3 py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <span className="text-xs text-slate-300">Extracting LSB pixel bits from canvas...</span>
              </div>
            )}

            {/* Verification Result */}
            {result && !scanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
              >
                {result.verified ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-400">
                            Cryptographically Verified Aura Masterpiece
                          </h4>
                          <p className="text-[11px] text-slate-400">Authentic LSB Steganographic signature verified</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        100% Tamper Proof
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">Original Creator</span>
                        <p className="font-bold text-cyan-300 text-sm mt-0.5">{result.data.author}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">Exhibition Timestamp</span>
                        <p className="font-semibold text-slate-300 text-xs mt-0.5">
                          {new Date(result.data.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider">Original Prompt Recipe</span>
                      <p className="leading-relaxed text-slate-200 text-xs">{result.data.prompt}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Fingerprint: <code className="text-cyan-400 font-mono text-[10px]">{result.data.fingerprint?.slice(0, 16)}...</code></span>
                      <span>Branch: {result.data.parentId ? '🧬 Forked Remix' : '👑 Root Ancestor'}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 py-2">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h4 className="text-sm font-bold text-amber-400">Unregistered External Artwork</h4>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        No Aura LSB steganographic signature was detected in the pixel bitstream. This image is either from an external source or was compressed by an external service removing pixel bit patterns.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <span className="text-xs text-slate-500">Aura Digital Provenance Engine</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProvenanceScannerModal;
