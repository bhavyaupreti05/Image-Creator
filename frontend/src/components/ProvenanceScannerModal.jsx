import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decodeArtworkDNA } from '../utils/steganography';
import { toast } from 'react-hot-toast';
import { ShieldCheckIcon, UploadIcon, CheckIcon, CloseIcon } from './Icons';

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
        toast.success('Authentic cryptographic signature verified');
      } else {
        toast('No embedded signature found in image.', { icon: 'ℹ' });
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
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  <ShieldCheckIcon className="h-3 w-3" />
                  <span>Provenance Verifier</span>
                </span>
                <span className="text-xs text-zinc-500">LSB bitstream extraction</span>
              </div>
              <h3 className="mt-1 text-lg font-semibold text-white">Verify Artwork Provenance</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 p-6 text-center transition hover:border-zinc-500 hover:bg-zinc-950/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition group-hover:text-white">
                <UploadIcon className="h-5 w-5" />
              </div>

              <h4 className="mt-2.5 text-xs sm:text-sm font-medium text-white">
                Drop artwork PNG to verify provenance
              </h4>
              <p className="mt-1 text-[11px] sm:text-xs text-zinc-500 max-w-sm">
                Reads hidden authorship and generation metadata invisibly encoded into pixel bitstreams.
              </p>

              <span className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition group-hover:bg-zinc-850 group-hover:text-white">
                Select File
              </span>
            </div>

            {/* Selected Image Thumbnail */}
            {previewUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <img
                  src={previewUrl}
                  alt="Scanned artwork"
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-white truncate">Loaded Image Buffer</p>
                  <p className="text-[11px] text-zinc-500">Scanning canvas pixel channels...</p>
                </div>
              </div>
            )}

            {/* Scanning Indicator */}
            {scanning && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                <span className="text-xs text-zinc-400">Extracting LSB metadata from canvas...</span>
              </div>
            )}

            {/* Verification Result */}
            {result && !scanning && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                {result.verified ? (
                  <>
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 border border-emerald-700/80 text-emerald-400">
                          <CheckIcon className="h-3 w-3 stroke-[2.5]" />
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-emerald-400">
                            Cryptographically Verified Artwork
                          </h4>
                          <p className="text-[11px] text-zinc-500">Authentic watermark signature confirmed</p>
                        </div>
                      </div>
                      <span className="rounded-md bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-800/60">
                        Authentic
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 text-xs">
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                        <span className="text-zinc-500 text-[10px] uppercase font-medium tracking-wider">Creator Handle</span>
                        <p className="font-semibold text-white text-xs mt-0.5">{result.data.author}</p>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                        <span className="text-zinc-500 text-[10px] uppercase font-medium tracking-wider">Creation Date</span>
                        <p className="font-medium text-zinc-300 text-xs mt-0.5">
                          {new Date(result.data.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs">
                      <span className="text-zinc-500 text-[10px] uppercase font-medium tracking-wider">Original Prompt</span>
                      <p className="leading-relaxed text-zinc-300 text-xs">{result.data.prompt}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                      <span>Fingerprint: <code className="text-zinc-300 font-mono text-[10px]">{result.data.fingerprint?.slice(0, 16)}...</code></span>
                      <span>Branch: {result.data.parentId ? 'Remix Fork' : 'Original Root'}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-2.5 py-1">
                    <span className="text-amber-400 font-semibold text-sm">!</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-amber-400">Unregistered External Artwork</h4>
                      <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                        No Aura watermark signature was detected in the pixel data. This image is either external or was compressed by an external service.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <span className="text-xs text-zinc-500">Aura Digital Provenance</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition"
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
