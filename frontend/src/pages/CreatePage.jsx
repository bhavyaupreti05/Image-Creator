import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import PromptInput from '../components/PromptInput';
import ImagePreview from '../components/ImagePreview';
import StoryExportModal from '../components/StoryExportModal';
import { createPost, createGenerationJob, streamJobProgress } from '../services/postService';

const randomPrompts = [
  'A neon-lit cyberpunk street in a rain-soaked futuristic city, octane render 8k',
  'A peaceful fantasy forest with glowing bioluminescent mushrooms and a moonlit stream, Studio Ghibli style',
  'An astronaut walking on a vibrant alien planet at sunset, cinematic lighting, photorealistic',
  'A cozy antique bookstore on a misty evening with warm golden lantern lights, oil painting texture',
  'Surreal floating islands with waterfalls pouring into space, cosmic nebula background, 3D render',
];

const CreatePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [remixAuthor, setRemixAuthor] = useState('');
  const [jobState, setJobState] = useState(null);
  const [showStoryExport, setShowStoryExport] = useState(false);

  useEffect(() => {
    const remixPrompt = searchParams.get('remix');
    const pId = searchParams.get('parentId');
    const author = searchParams.get('author');

    if (remixPrompt) {
      setPrompt(decodeURIComponent(remixPrompt));
      if (pId) setParentId(pId);
      if (author) setRemixAuthor(decodeURIComponent(author));
    }
  }, [searchParams]);

  const handleClearRemix = () => {
    setSearchParams({});
    setPrompt('');
    setParentId(null);
    setRemixAuthor('');
  };

  const handleRandomPrompt = () => {
    const selected = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(selected);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt.');
      return;
    }

    setLoading(true);
    setJobState({ status: 'queued', progress: 15, stage: 'Request accepted & queued in pipeline...' });

    try {
      const jobData = await createGenerationJob(prompt.trim());

      streamJobProgress(
        jobData.jobId,
        (progressState) => {
          setJobState(progressState);
        },
        (completedJob) => {
          setImage(completedJob.photo);
          setLoading(false);
          toast.success('Artwork synthesized successfully!');
        },
        (error) => {
          setLoading(false);
          toast.error(error.message || 'Generation failed');
        },
      );
    } catch (error) {
      setLoading(false);
      const isNetwork = !error?.response;
      const msg = error?.response?.data?.message || (isNetwork ? 'API waking up from sleep. Please retry in 15 seconds!' : 'Failed to submit generation job');
      toast.error(msg);
    }
  };

  const handleShare = async () => {
    if (!name.trim() || !prompt.trim() || !image) {
      toast.error('Please provide your name, prompt, and synthesized image.');
      return;
    }

    try {
      await createPost({
        name: name.trim(),
        prompt: prompt.trim(),
        photo: image,
        parentId: parentId || null,
      });
      toast.success(parentId ? '✨ Remix shared to the community!' : 'Artwork exhibited in community gallery!');
      setName('');
      setPrompt('');
      setImage('');
      handleClearRemix();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to exhibit artwork');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      {/* Creation Studio */}
      <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/80 p-7 shadow-[0_20px_80px_rgba(2,8,23,0.35)] backdrop-blur lg:p-9">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-semibold text-indigo-300">
            Aura Studio
          </span>
          <h2 className="text-3xl font-extrabold text-white">Synthesize Art</h2>
          <p className="text-sm text-slate-400">Compose an imaginative concept, generate ultra high-res visuals, and exhibit in the community.</p>
        </div>

        {/* Remix Lineage Badge if remixing */}
        {remixAuthor && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <span className="text-sm">✨</span>
              <span>
                Remixing concept by <strong className="text-white">{remixAuthor}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearRemix}
              className="text-xs text-purple-300 underline hover:text-white"
            >
              Reset
            </button>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Creator Name / Handle</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="e.g. @bhavya"
            />
          </div>

          <PromptInput value={prompt} onChange={setPrompt} onRandomize={handleRandomPrompt} />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Synthesizing...' : 'Synthesize Visual'}
            </button>
            <button
              onClick={handleShare}
              disabled={!image}
              className="rounded-full border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Exhibit to Community
            </button>
            {image && (
              <button
                type="button"
                onClick={() => setShowStoryExport(true)}
                className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-5 py-3.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
              >
                <span>📱 Export Story Card</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/80 p-7 shadow-[0_20px_80px_rgba(2,8,23,0.35)] backdrop-blur lg:p-9">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Live Canvas</h3>
          <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-400">
            Cloudinary Auto-Format
          </span>
        </div>
        <div className="mt-6">
          <ImagePreview image={image} loading={loading} jobState={jobState} />
        </div>
      </div>

      {/* Story Export Modal */}
      {showStoryExport && (
        <StoryExportModal
          post={{
            name: name.trim() || 'Aura Creator',
            prompt: prompt.trim(),
            photo: image,
            parentId,
            createdAt: new Date().toISOString(),
          }}
          onClose={() => setShowStoryExport(false)}
        />
      )}
    </motion.div>
  );
};

export default CreatePage;
