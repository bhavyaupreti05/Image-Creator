import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { encodeArtworkDNA } from '../utils/steganography';

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
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.45, '#0b0f19');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Ambient radial glow from top & bottom
      const glowTop = ctx.createRadialGradient(540, 260, 50, 540, 260, 600);
      glowTop.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      glowTop.addColorStop(1, 'transparent');
      ctx.fillStyle = glowTop;
      ctx.fillRect(0, 0, 1080, 800);

      const glowBottom = ctx.createRadialGradient(540, 1650, 50, 540, 1650, 750);
      glowBottom.addColorStop(0, 'rgba(99, 102, 241, 0.28)');
      glowBottom.addColorStop(1, 'transparent');
      ctx.fillStyle = glowBottom;
      ctx.fillRect(0, 1100, 1080, 820);

      // 2. Top Header & Branding
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦  A U R A   G A L L E R Y  ✦', 540, 170);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.font = '500 22px Inter, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('AI GENERATIVE ART & REMIX STUDIO', 540, 215);
      ctx.restore();

      // 3. Central Artwork Frame (900x900)
      const frameX = 90;
      const frameY = 290;
      const frameSize = 900;
      const radius = 44;

      // Frame background & shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 30;

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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // 4. Bottom Creator & Metadata Section
      const cardY = 1250;

      // Creator Avatar Circle
      const avatarX = 140;
      const avatarY = cardY + 50;
      const avatarRadius = 45;
      const creatorInitial = (post.name?.replace(/^@/, '').trim()?.[0] || 'A').toUpperCase();

      const avatarGrad = ctx.createLinearGradient(avatarX - 45, avatarY - 45, avatarX + 45, avatarY + 45);
      avatarGrad.addColorStop(0, '#06b6d4');
      avatarGrad.addColorStop(1, '#6366f1');

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = avatarGrad;
      ctx.fill();

      // Avatar Initial Letter
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(creatorInitial, avatarX, avatarY + 2);
      ctx.restore();

      // Creator Handle & Exhibition Date
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 38px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`@${post.name.replace(/^@/, '')}`, 215, cardY + 38);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 24px Inter, sans-serif';
      const dateStr = new Date(post.createdAt || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      ctx.fillText(`Exhibited in Aura Gallery • ${dateStr}`, 215, cardY + 74);
      ctx.restore();

      // Prompt Container
      ctx.save();
      // Frosted Prompt Background Box
      const promptBoxY = cardY + 120;
      const promptBoxHeight = 360;
      const pRadius = 28;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(90 + pRadius, promptBoxY);
      ctx.lineTo(990 - pRadius, promptBoxY);
      ctx.quadraticCurveTo(990, promptBoxY, 990, promptBoxY + pRadius);
      ctx.lineTo(990, promptBoxY + promptBoxHeight - pRadius);
      ctx.quadraticCurveTo(990, promptBoxY + promptBoxHeight, 990 - pRadius, promptBoxY + promptBoxHeight);
      ctx.lineTo(90 + pRadius, promptBoxY + promptBoxHeight);
      ctx.quadraticCurveTo(90, promptBoxY + promptBoxHeight, 90, promptBoxY + promptBoxHeight - pRadius);
      ctx.lineTo(90, promptBoxY + pRadius);
      ctx.quadraticCurveTo(90, promptBoxY, 90 + pRadius, promptBoxY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // "PROMPT" label
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PROMPT RECIPE', 130, promptBoxY + 50);

      // Prompt Quote Content with word wrapping
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 28px Inter, sans-serif';
      const maxTextWidth = 820;
      const lineHeight = 44;
      const words = post.prompt.split(' ');
      let line = '';
      let textY = promptBoxY + 105;
      let lineCount = 0;

      for (let n = 0; n < words.length; n++) {
        if (lineCount >= 5) {
          ctx.fillText(line + '...', 130, textY);
          break;
        }
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          ctx.fillText(line, 130, textY);
          line = words[n] + ' ';
          textY += lineHeight;
          lineCount++;
        } else {
          line = testLine;
        }
      }
      if (lineCount < 5) {
        ctx.fillText(line, 130, textY);
      }
      ctx.restore();

      // 5. Footer Lineage & Watermark
      ctx.save();
      ctx.fillStyle = 'rgba(203, 213, 225, 0.75)';
      ctx.font = '600 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      const lineageText = post.parentId
        ? '🧬 Evolutionary Remix Branch • Aura Studio'
        : '✨ Original AI Masterpiece • Aura Studio';
      ctx.fillText(lineageText, 540, 1820);
      ctx.restore();

      // Embed Cryptographic Steganographic DNA into the Canvas Pixels
      try {
        encodeArtworkDNA(canvas, {
          author: post.name,
          prompt: post.prompt,
          parentId: post.parentId,
          createdAt: post.createdAt,
          fingerprint: `${post._id || Date.now()}`,
        });
      } catch (stegoErr) {
        console.warn('Steganography encoding skipped', stegoErr);
      }

      try {
        setDownloadUrl(canvas.toDataURL('image/png'));
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
    toast.success('Instagram Story card downloaded! 📱');
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
        toast.success('Story card copied to clipboard! Paste directly in Instagram or Discord.');
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
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">📱 Export Instagram Story Card</h3>
              <p className="text-xs text-slate-400">9:16 vertical 1080×1920 HD graphic ready for Instagram Stories & X</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Canvas Live Preview Container */}
          <div className="my-5 flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/60 p-3">
            {rendering && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                <p className="text-xs text-slate-400">Rendering 1080×1920 Story Canvas...</p>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={`max-h-[52vh] w-auto rounded-xl object-contain shadow-2xl ${
                rendering ? 'hidden' : 'block'
              }`}
            />
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">1080 × 1920 px (9:16)</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
              {canCopy && (
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={rendering}
                  className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95 disabled:opacity-50"
                >
                  📋 Copy Image
                </button>
              )}
              <button
                type="button"
                onClick={handleDownload}
                disabled={rendering || !downloadUrl}
                className="rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                📥 Download PNG
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StoryExportModal;

