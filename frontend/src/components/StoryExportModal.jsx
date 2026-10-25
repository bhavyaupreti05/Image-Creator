import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { encodeArtworkDNA } from '../utils/steganography';
import { DownloadIcon, CopyIcon, CloseIcon } from './Icons';

const StoryExportModal = ({ post, onClose }) => {
  const canvasRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [rendering, setRendering] = useState(true);
  const [canCopy, setCanCopy] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ClipboardItem && navigator.clipboard?.write) {
      setCanCopy(true);
    }
  }, []);

  useEffect(() => {
    if (!post) return;

    let isMounted = true;
    setRendering(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = post.photo;

    img.onload = () => {
      if (!isMounted) return;

      // 1. Dark Luxe Canvas Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#121217');
      bgGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Subtle ambient top & bottom glow
      const glowTop = ctx.createRadialGradient(540, 200, 50, 540, 200, 500);
      glowTop.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      glowTop.addColorStop(1, 'transparent');
      ctx.fillStyle = glowTop;
      ctx.fillRect(0, 0, 1080, 600);

      // 2. Top Header & Branding
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 32px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText('A U R A   S T U D I O', 540, 170);

      ctx.fillStyle = 'rgba(161, 161, 170, 0.8)';
      ctx.font = '400 20px Inter, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('CURATED AI ARTWORK & REMIX ENGINE', 540, 215);
      ctx.restore();

      // 3. Central Artwork Frame (900x900)
      const frameX = 90;
      const frameY = 280;
      const frameSize = 900;
      const radius = 32;

      // Frame background & shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 24;

      // Rounded rectangle clip
      ctx.beginPath();
      ctx.moveTo(frameX + radius, frameY);
      ctx.lineTo(frameX + frameSize - radius, frameY);
      ctx.quadraticCurveTo(frameX + frameSize, frameY, frameX + frameSize, frameY + radius);
      ctx.lineTo(frameX + frameSize, frameY + frameSize - radius);
      ctx.quadraticCurveTo(frameX + frameSize, frameY + frameSize, frameX + frameSize - radius, frameY + frameSize);
      ctx.lineTo(frameX + radius, frameY + frameSize);
      ctx.quadraticCurveTo(frameX, frameY + frameSize, frameX, frameY + frameSize - radius);
      ctx.lineTo(frameX, frameY + radius);
      ctx.quadraticCurveTo(frameX, frameY, frameX + radius, frameY);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, frameX, frameY, frameSize, frameSize);
      ctx.restore();

      // Delicate stroke border around artwork
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 4. Bottom Creator & Metadata Section
      const cardY = 1240;

      // Creator Avatar Circle
      const avatarX = 140;
      const avatarY = cardY + 50;
      const avatarRadius = 40;
      const creatorInitial = (post.name?.replace(/^@/, '').trim()?.[0] || 'A').toUpperCase();

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Avatar Initial Letter
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(creatorInitial, avatarX, avatarY + 2);
      ctx.restore();

      // Creator Handle & Exhibition Date
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 34px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`@${post.name.replace(/^@/, '')}`, 210, cardY + 40);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '400 22px Inter, sans-serif';
      const dateStr = new Date(post.createdAt || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      ctx.fillText(`Aura Gallery • ${dateStr}`, 210, cardY + 76);
      ctx.restore();

      // Prompt Container
      ctx.save();
      const promptBoxY = cardY + 120;
      const promptBoxHeight = 360;
      const pRadius = 24;

      ctx.fillStyle = 'rgba(24, 24, 27, 0.7)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(frameX + pRadius, promptBoxY);
      ctx.lineTo(frameX + frameSize - pRadius, promptBoxY);
      ctx.quadraticCurveTo(frameX + frameSize, promptBoxY, frameX + frameSize, promptBoxY + pRadius);
      ctx.lineTo(frameX + frameSize, promptBoxY + promptBoxHeight - pRadius);
      ctx.quadraticCurveTo(frameX + frameSize, promptBoxY + promptBoxHeight, frameX + frameSize - pRadius, promptBoxY + promptBoxHeight);
      ctx.lineTo(frameX + pRadius, promptBoxY + promptBoxHeight);
      ctx.quadraticCurveTo(frameX, promptBoxY + promptBoxHeight, frameX, promptBoxY + promptBoxHeight - pRadius);
      ctx.lineTo(frameX, promptBoxY + pRadius);
      ctx.quadraticCurveTo(frameX, promptBoxY, frameX + pRadius, promptBoxY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Prompt Header
      ctx.fillStyle = '#71717a';
      ctx.font = '600 20px Inter, sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('PROMPT', frameX + 36, promptBoxY + 54);

      // Multi-line Prompt Text Wrapping
      ctx.fillStyle = '#e4e4e7';
      ctx.font = '400 26px Inter, sans-serif';
      ctx.letterSpacing = '0px';

      const words = (post.prompt || '').split(' ');
      let line = '';
      let textY = promptBoxY + 104;
      const maxLineWidth = frameSize - 72;
      const lineHeight = 40;
      let lineCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && n > 0) {
          ctx.fillText(line, frameX + 36, textY);
          line = words[n] + ' ';
          textY += lineHeight;
          lineCount++;
          if (lineCount >= 5) {
            line = line.trim() + '...';
            break;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, frameX + 36, textY);
      ctx.restore();

      // 5. Watermark Footer
      ctx.save();
      ctx.fillStyle = '#71717a';
      ctx.font = '500 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Created & Remixed on Aura Studio', 540, 1850);
      ctx.restore();

      // 6. Steganographic DNA Encoding into Story Image
      try {
        const dnaPayload = {
          author: post.name,
          prompt: post.prompt,
          parentId: post.parentId || null,
          createdAt: post.createdAt || new Date().toISOString(),
          version: '1.0',
        };
        encodeArtworkDNA(canvas, dnaPayload);
        const dataUrl = canvas.toDataURL('image/png');
        setDownloadUrl(dataUrl);
      } catch (err) {
        console.warn('Canvas export tainted', err);
      }
      setRendering(false);
    };

    img.onerror = () => {
      setRendering(false);
      toast.error('Unable to load high-res image for story canvas');
    };

    return () => {
      isMounted = false;
    };
  }, [post]);

  const handleDownload = () => {
    if (!downloadUrl) {
      toast.error('Card rendering in progress...');
      return;
    }
    const link = document.createElement('a');
    link.download = `AuraStory-${post.name.replace(/^@/, '')}-${Date.now()}.png`;
    link.href = downloadUrl;
    link.click();
    toast.success('Story card downloaded');
  };

  const handleCopyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to create image blob');
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        toast.success('Story card copied to clipboard');
      } catch (err) {
        console.warn('Clipboard write failed', err);
        toast.error('Clipboard copy not supported in this browser. Use Download instead.');
      }
    }, 'image/png');
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
          className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-7 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-semibold text-white">Export Story Card</h3>
              <p className="text-xs text-zinc-500">9:16 high-resolution format for Instagram & social sharing</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Canvas Live Preview Container */}
          <div className="my-4 flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 p-3">
            {rendering && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                <p className="text-xs text-zinc-500">Generating canvas preview...</p>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`max-h-[50vh] w-auto rounded-lg object-contain shadow-xl ${
                rendering ? 'hidden' : 'block'
              }`}
            />
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-zinc-500">1080 × 1920 (9:16)</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
              >
                Close
              </button>
              {canCopy && (
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={rendering}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                  <span>Copy Image</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDownload}
                disabled={rendering || !downloadUrl}
                className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-xs font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50 shadow-sm"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StoryExportModal;
