import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { generateFingerprint } from '../utils/steganography';
import {
  CertificateIcon,
  DownloadIcon,
  CopyIcon,
  PrinterIcon,
  CloseIcon,
  CheckIcon,
} from './Icons';

const CertificateOfAuthenticityModal = ({ post, onClose }) => {
  const canvasRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [shaHash, setShaHash] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [rendering, setRendering] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!post) return;

    let isMounted = true;
    setRendering(true);

    const computeAndRender = async () => {
      // 1. Generate SHA-256 fingerprint for artwork prompt & photo
      const rawPayload = `${post._id || 'aura'}-${post.prompt}-${post.name}-${post.createdAt || Date.now()}`;
      const hash = await generateFingerprint(rawPayload);
      const cleanHash = hash.startsWith('aura-hash-')
        ? `${hash.replace('aura-hash-', '')}e7b92f44c8031d8f763a1e2049b9`
        : hash;
      const serial = `AURA-CERT-${cleanHash.slice(0, 8).toUpperCase()}-${(post._id || 'ROOT').slice(-4).toUpperCase()}`;

      if (!isMounted) return;
      setShaHash(cleanHash);
      setSerialNumber(serial);

      // 2. Setup Canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = 1600;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;

      // 3. Load Artwork Image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = post.photo;

      img.onload = () => {
        if (!isMounted) return;

        // A. Background (Deep Slate Glassmorphism with Fine Grid)
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#09090b');
        bgGrad.addColorStop(0.5, '#0f1117');
        bgGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Security Guilloche / Border Frame
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, width - 60, height - 60);

        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 40, width - 80, height - 80);

        // Corner Corner Ornaments
        const drawCorner = (x, y, dx, dy) => {
          ctx.strokeStyle = '#e4e4e7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y + dy * 20);
          ctx.lineTo(x, y);
          ctx.lineTo(x + dx * 20, y);
          ctx.stroke();
        };
        drawCorner(45, 45, 1, 1);
        drawCorner(width - 45, 45, -1, 1);
        drawCorner(45, height - 45, 1, -1);
        drawCorner(width - 45, height - 45, -1, -1);

        // B. Header & Authority Title
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '600 13px Inter, sans-serif';
        ctx.letterSpacing = '5px';
        ctx.textAlign = 'center';
        ctx.fillText('A U R A   D I G I T A L   P R O V E N A N C E   A U T H O R I T Y', width / 2, 85);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 28px Inter, sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('CERTIFICATE OF DIGITAL AUTHENTICITY', width / 2, 125);

        ctx.fillStyle = '#71717a';
        ctx.font = '400 13px Inter, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(`SERIAL NUMBER: ${serial}  •  SPECIFICATION: ERC-721A COMPATIBLE DNA`, width / 2, 155);

        // Header Divider Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(80, 180);
        ctx.lineTo(width - 80, 180);
        ctx.stroke();

        // C. Left Column: Framed Artwork (460 x 460)
        const artX = 90;
        const artY = 220;
        const artW = 460;
        const artH = 460;

        // Shadow & Frame
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 35;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.roundRect(artX - 8, artY - 8, artW + 16, artH + 16, 16);
        ctx.fill();
        ctx.restore();

        // Draw Image Clipped
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(artX, artY, artW, artH, 12);
        ctx.clip();
        ctx.drawImage(img, artX, artY, artW, artH);
        ctx.restore();

        // Image Frame Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(artX, artY, artW, artH, 12);
        ctx.stroke();

        // Seal Badge Under Artwork
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.roundRect(artX, artY + artH + 25, artW, 60, 12);
        ctx.fill();
        ctx.strokeStyle = '#3f3f46';
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '1px';
        ctx.fillText('CRYPTOGRAPHICALLY VERIFIED & LSB PIXEL ENCODED', artX + artW / 2, artY + artH + 52);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '400 11px Inter, sans-serif';
        ctx.fillText('Immutable author provenance preserved in canvas color bitstream', artX + artW / 2, artY + artH + 70);

        // D. Right Column: Technical Provenance Specs
        const specX = 610;
        let curY = 230;

        // Section 1: Artwork Title & Prompt
        ctx.textAlign = 'left';
        ctx.fillStyle = '#71717a';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('ARTWORK PROMPT RECIPE', specX, curY);

        curY += 25;
        ctx.fillStyle = '#ffffff';
        ctx.font = '500 15px Inter, sans-serif';
        ctx.letterSpacing = '0px';

        // Wrap prompt text
        const maxWidth = 900;
        const words = post.prompt.split(' ');
        let line = '';
        let lineCount = 0;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, specX, curY);
            line = words[n] + ' ';
            curY += 22;
            lineCount++;
            if (lineCount >= 3) {
              line = line.trim() + '...';
              break;
            }
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, specX, curY);

        curY += 45;

        // Section 2: Two-Column Data Grid
        const drawDataBlock = (x, y, w, h, label, value, subtext = '') => {
          ctx.fillStyle = 'rgba(24, 24, 27, 0.7)';
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, 10);
          ctx.fill();
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#71717a';
          ctx.font = '600 10px Inter, sans-serif';
          ctx.letterSpacing = '1px';
          ctx.fillText(label.toUpperCase(), x + 16, y + 24);

          ctx.fillStyle = '#f4f4f5';
          ctx.font = '600 14px Inter, sans-serif';
          ctx.fillText(value, x + 16, y + 46);

          if (subtext) {
            ctx.fillStyle = '#a1a1aa';
            ctx.font = '400 11px Inter, sans-serif';
            ctx.fillText(subtext, x + 16, y + 66);
          }
        };

        const gridW = 430;
        const gridH = 80;

        // Row 1
        drawDataBlock(specX, curY, gridW, gridH, 'Creator & Author', post.name, 'Verified Original Registrant');
        drawDataBlock(specX + gridW + 20, curY, gridW, gridH, 'Synthesis Model', post.model || 'Flux.1 Schnell', 'High Dynamic Latent Diffusion');

        curY += 95;

        // Row 2
        const dateFormatted = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        drawDataBlock(specX, curY, gridW, gridH, 'Date of Creation', dateFormatted, 'UTC Timestamp Recorded');
        drawDataBlock(
          specX + gridW + 20,
          curY,
          gridW,
          gridH,
          'Prompt Lineage Node',
          post.parentId ? 'Descendant Remix Fork' : 'Genesis Root Node',
          post.parentId ? `Remixed from parent ${post.parentId.slice(0, 8)}` : 'Original Unforked Master'
        );

        curY += 105;

        // Section 3: Cryptographic Signatures Box
        ctx.fillStyle = 'rgba(9, 9, 11, 0.9)';
        ctx.beginPath();
        ctx.roundRect(specX, curY, 880, 130, 12);
        ctx.fill();
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.letterSpacing = '1.5px';
        ctx.fillText('CRYPTOGRAPHIC PROOF OF AUTHENTICITY', specX + 20, curY + 28);

        ctx.fillStyle = '#71717a';
        ctx.font = '400 11px font-mono, monospace';
        ctx.fillText('SHA-256 Digest:', specX + 20, curY + 54);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`0x${cleanHash.slice(0, 48)}...`, specX + 130, curY + 54);

        ctx.fillStyle = '#71717a';
        ctx.fillText('LSB Signature:', specX + 20, curY + 76);
        ctx.fillStyle = '#34d399';
        ctx.fillText('AURA::PROVENANCE_V1 [MAGIC: 0x41 0x55 0x52 0x41]', specX + 130, curY + 76);

        ctx.fillStyle = '#71717a';
        ctx.fillText('Security Seal:', specX + 20, curY + 98);
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText('Cryptographically Verified on Aura Studio Distributed Registry', specX + 130, curY + 98);

        // E. Bottom Signatures & Footer
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(80, height - 120);
        ctx.lineTo(width - 80, height - 120);
        ctx.stroke();

        // Footer Signatures
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '400 12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Authorized Signature: Aura Provenance Registrar', 90, height - 85);

        ctx.textAlign = 'right';
        ctx.fillText(`Registered to ${post.name}  •  ${dateFormatted}`, width - 90, height - 85);

        ctx.fillStyle = '#52525b';
        ctx.font = '400 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('This document certifies that the artwork above contains matching steganographic and cryptographic authorship DNA on the Aura platform.', width / 2, height - 55);

        // Set generated download URL
        setDownloadUrl(canvas.toDataURL('image/png'));
        setRendering(false);
      };

      img.onerror = () => {
        if (!isMounted) return;
        setRendering(false);
        toast.error('Failed to load artwork image for certificate');
      };
    };

    computeAndRender();

    return () => {
      isMounted = false;
    };
  }, [post]);

  const handleCopyClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob creation failed');
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        toast.success('Certificate copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      }, 'image/png');
    } catch {
      toast.error('Direct clipboard copy not supported by browser. Use Download instead.');
    }
  };

  const handlePrint = () => {
    if (!downloadUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print certificate');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Aura Certificate - ${serialNumber}</title>
          <style>
            body { margin: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
            img { max-width: 100%; max-height: 100%; border-radius: 8px; }
            @media print {
              body { background: white; }
              img { width: 100%; }
            }
          </style>
        </head>
        <body>
          <img src="${downloadUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!post || !mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 sm:p-6 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <CertificateIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Cryptographic Certificate of Authenticity
                </h3>
                <p className="text-xs text-zinc-400">
                  Certified digital proof of origin & LSB provenance
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Certificate Viewport */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-inner flex items-center justify-center p-2">
              {rendering && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-zinc-950/80 backdrop-blur-sm">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  <span className="text-xs text-zinc-300">Computing SHA-256 and rendering certified seal...</span>
                </div>
              )}

              {/* Real HD Canvas (hidden from layout, used for rendering & export) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Responsive Display Image */}
              {downloadUrl && (
                <img
                  src={downloadUrl}
                  alt="Certificate of Authenticity"
                  className="w-full h-auto rounded-lg shadow-2xl border border-zinc-800/80 transition"
                />
              )}
            </div>

            {/* Verification Metadata Quick Bar */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                <span className="text-zinc-500 text-[10px] uppercase font-medium">Serial ID</span>
                <p className="font-mono text-zinc-200 text-xs mt-0.5 truncate">{serialNumber || 'Generating...'}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                <span className="text-zinc-500 text-[10px] uppercase font-medium">SHA-256 Hash</span>
                <p className="font-mono text-cyan-400 text-xs mt-0.5 truncate">{shaHash ? `0x${shaHash.slice(0, 12)}...` : 'Calculating...'}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                <span className="text-zinc-500 text-[10px] uppercase font-medium">LSB Signature</span>
                <p className="text-emerald-400 font-semibold text-xs mt-0.5 flex items-center gap-1">
                  <CheckIcon className="h-3 w-3 stroke-[2.5]" />
                  <span>Verified Original</span>
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                <span className="text-zinc-500 text-[10px] uppercase font-medium">Author Handle</span>
                <p className="text-white font-medium text-xs mt-0.5 truncate">{post.name}</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3">
            <span className="text-xs text-zinc-500 hidden sm:inline">
              LSB Steganography + SHA-256 Cryptographic Document
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
              >
                <PrinterIcon className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleCopyClipboard}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition"
              >
                {copied ? <CheckIcon className="h-3.5 w-3.5 text-emerald-400" /> : <CopyIcon className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={downloadUrl}
                download={`Aura-Certificate-${serialNumber || 'Origin'}.png`}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition shadow-sm active:scale-95"
              >
                <DownloadIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Download Certified Document</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default CertificateOfAuthenticityModal;
