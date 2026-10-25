import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import PromptInput from '../components/PromptInput';
import ImagePreview from '../components/ImagePreview';
import StoryExportModal from '../components/StoryExportModal';
import { ShareIcon, BranchIcon } from '../components/Icons';
import { createPost, createGenerationJob, streamJobProgress } from '../services/postService';

const randomPrompts = [
  'A minimalist brutalist pavilion surrounded by misty Japanese bamboo forest, dusk lighting, architectural photography',
  'An astronaut walking on a calm alien ocean under a giant violet ringed planet, cinematic lighting, 8k resolution',
  'Warm golden hour sunlight through tall library windows, dust motes in the air, soft oil painting texture',
  'Isometric futuristic greenhouse in a cyberpunk metropolis, overgrown flora, soft reflections, octane render',
  'Surreal floating monolithic rock in a silent desert under a solar eclipse, sharp details, Hasselblad capture',
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
    setJobState({ status: 'queued', progress: 15, stage: 'Request queued in processing pipeline...' });

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
          toast.success('Image generated successfully');
        },
        (error) => {
          setLoading(false);
          toast.error(error.message || 'Generation failed');
        },
      );
    } catch (error) {
      setLoading(false);
      const isNetwork = !error?.response;
      const msg = error?.response?.data?.message || (isNetwork ? 'API waking up from sleep. Please retry in 15 seconds.' : 'Failed to submit generation job');
      toast.error(msg);
    }
  };

  const handleShare = async () => {
    if (!name.trim() || !prompt.trim() || !image) {
      toast.error('Please enter your name/handle and generate an image first.');
      return;
    }

    try {
      await createPost({
        name: name.trim(),
        prompt: prompt.trim(),
        photo: image,
        parentId: parentId || null,
      });
      toast.success(parentId ? 'Remix published to gallery' : 'Artwork published to gallery');
      setName('');
      setPrompt('');
      setImage('');
      handleClearRemix();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to publish artwork');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid gap-6 lg:grid-cols-[1fr_1fr]"
    >
      {/* Creation Studio */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8">
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Studio
          </span>
          <h2 className="text-2xl font-semibold text-white">Create Artwork</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Enter a prompt, render the image, and publish it to the community gallery.
          </p>
        </div>

        {/* Remix info banner */}
        {remixAuthor && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <BranchIcon className="h-4 w-4 text-zinc-400" />
              <span>
                Remixing concept by <strong className="text-white">@{remixAuthor.replace(/^@/, '')}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearRemix}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Reset
            </button>
          </div>
        )}

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Creator Name or Handle
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
              placeholder="e.g. bhavya"
            />
          </div>

          <PromptInput value={prompt} onChange={setPrompt} onRandomize={handleRandomPrompt} />

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-lg bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Generating...' : 'Generate Image'}
            </button>

            <button
              onClick={handleShare}
              disabled={!image}
              className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Publish to Gallery
            </button>

            {image && (
              <button
                type="button"
                onClick={() => setShowStoryExport(true)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white active:scale-95"
              >
                <ShareIcon className="h-3.5 w-3.5" />
                <span>Export Story</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
          <h3 className="text-base font-semibold text-white">Preview Canvas</h3>
          <span className="rounded-md border border-zinc-800 bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
            1024 × 1024
          </span>
        </div>
        <div className="mt-5 flex-1 flex flex-col justify-center">
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
