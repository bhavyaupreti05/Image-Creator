import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import PromptInput from '../components/PromptInput';
import ImagePreview from '../components/ImagePreview';
import StoryExportModal from '../components/StoryExportModal';
import {
  ShareIcon,
  BranchIcon,
  CpuChipIcon,
  SlidersIcon,
  LockClosedIcon,
  EyeIcon,
  CoinsIcon,
} from '../components/Icons';
import { createPost, createGenerationJob, streamJobProgress } from '../services/postService';
import { useAuth } from '../context/AuthContext';

const AI_MODELS = [
  { id: 'flux', name: 'Flux.1 Schnell', tag: 'Fast & Photorealistic', badge: 'State-of-the-Art' },
  { id: 'dall-e-3', name: 'DALL-E 3', tag: 'OpenAI Prompt Fidelity', badge: 'Detailed' },
  { id: 'midjourney', name: 'Midjourney v6', tag: 'Cinematic & Painterly', badge: 'Aesthetic' },
  { id: 'sdxl', name: 'Stable Diffusion XL', tag: 'High Dynamic Range', badge: 'Open-Weight' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', desc: '1024×1024' },
  { id: '9:16', label: '9:16 Story', desc: '768×1360' },
  { id: '16:9', label: '16:9 Landscape', desc: '1360×768' },
];

const randomPrompts = [
  'A minimalist brutalist pavilion surrounded by misty Japanese bamboo forest, dusk lighting, architectural photography',
  'An astronaut walking on a calm alien ocean under a giant violet ringed planet, cinematic lighting, 8k resolution',
  'Warm golden hour sunlight through tall library windows, dust motes in the air, soft oil painting texture',
  'Isometric futuristic greenhouse in a cyberpunk metropolis, overgrown flora, soft reflections, octane render',
  'Surreal floating monolithic rock in a silent desert under a solar eclipse, sharp details, Hasselblad capture',
  'Futuristic cybernetic portrait with holographic visor reflections and neon chromatic aberration, high fashion aesthetic',
];

const CreatePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState(user?.username || '@creator');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [recipePrice, setRecipePrice] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [remixAuthor, setRemixAuthor] = useState('');
  const [jobState, setJobState] = useState(null);
  const [showStoryExport, setShowStoryExport] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setName(user.username);
    }
  }, [user]);

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
    const activeModelObj = AI_MODELS.find((m) => m.id === selectedModel);
    setJobState({
      status: 'queued',
      progress: 15,
      stage: `Queued on ${activeModelObj?.name || 'Flux.1'} diffusion cluster...`,
    });

    try {
      const jobData = await createGenerationJob(prompt.trim(), {
        model: selectedModel,
        aspectRatio,
        negativePrompt: negativePrompt.trim(),
      });

      streamJobProgress(
        jobData.jobId,
        (progressState) => {
          setJobState(progressState);
        },
        (completedJob) => {
          setImage(completedJob.photo);
          setLoading(false);
          toast.success(`Artwork synthesized using ${activeModelObj?.name || 'Flux.1'}`);
        },
        (error) => {
          setLoading(false);
          toast.error(error.message || 'Generation failed');
        },
      );
    } catch (error) {
      setLoading(false);
      const isNetwork = !error?.response;
      const msg =
        error?.response?.data?.message ||
        (isNetwork ? 'API waking up from sleep. Please retry in 15 seconds.' : 'Failed to submit generation job');
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
        isPrivate,
        model: AI_MODELS.find((m) => m.id === selectedModel)?.name || 'Flux.1',
        negativePrompt: negativePrompt.trim(),
        aspectRatio,
        recipePrice: Number(recipePrice) || 10,
      });

      if (isPrivate) {
        toast.success('Artwork saved to your Private Vault 🔒');
      } else {
        toast.success(parentId ? 'Remix published to community gallery' : 'Artwork published to community gallery');
      }

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
      className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
    >
      {/* Creation Studio */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-7">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Studio & Multi-Model Synthesis
            </span>
            {/* Private Vault / Public Toggle */}
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                isPrivate
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isPrivate ? (
                <>
                  <LockClosedIcon className="h-3 w-3" />
                  <span>Private Vault</span>
                </>
              ) : (
                <>
                  <EyeIcon className="h-3 w-3" />
                  <span>Public Gallery</span>
                </>
              )}
            </button>
          </div>
          <h2 className="text-2xl font-semibold text-white">Create Artwork</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Select a diffusion model, prompt your concept, and save to your vault or public exhibition.
          </p>
        </div>

        {/* Remix info banner */}
        {remixAuthor && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <BranchIcon className="h-4 w-4 text-zinc-400" />
              <span>
                Remixing concept by <strong className="text-white">@{remixAuthor.replace(/^@/, '')}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearRemix}
              className="text-zinc-400 hover:text-white transition"
            >
              Clear
            </button>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Creator Handle */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Creator Handle</label>
            <input
              type="text"
              placeholder="@yourhandle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>

          {/* Multi-Model Selector */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <CpuChipIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span>Synthesis Model Engine</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AI_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModel(model.id)}
                    className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                      isSelected
                        ? 'border-zinc-400 bg-zinc-800/90 ring-1 ring-zinc-400'
                        : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-white">{model.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{model.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Canvas Dimensions</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id)}
                  className={`rounded-xl border py-2 px-2.5 text-center text-xs font-medium transition ${
                    aspectRatio === ar.id
                      ? 'border-zinc-400 bg-zinc-800 text-white'
                      : 'border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div>{ar.label}</div>
                  <div className="text-[10px] text-zinc-400">{ar.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <PromptInput
            prompt={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onSurpriseMe={handleRandomPrompt}
          />

          {/* Advanced Prompt Engineering Drawer Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              <SlidersIcon className="h-3.5 w-3.5" />
              <span>{showAdvanced ? 'Hide Advanced Recipe Settings' : 'Advanced Prompt Engineering & Marketplace'}</span>
            </button>

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-300">
                    Negative Prompt (What to exclude)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. blurry, watermark, deformed, noisy"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-zinc-300">Prompt Marketplace Tip / Formula Unlock</span>
                    <p className="text-[10px] text-zinc-400">Creators earn Aura Credits when someone unlocks this formula</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-amber-300">
                    <CoinsIcon className="h-3.5 w-3.5" />
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={recipePrice}
                      onChange={(e) => setRecipePrice(Number(e.target.value))}
                      className="w-8 bg-transparent text-center font-semibold text-amber-300 focus:outline-none"
                    />
                    <span>credits</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={loading || !prompt.trim()}
              onClick={handleGenerate}
              className="flex-1 rounded-xl bg-white py-2.5 text-xs sm:text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
            >
              {loading ? 'Synthesizing...' : 'Generate Artwork'}
            </button>

            {image && (
              <button
                type="button"
                disabled={loading}
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-95"
              >
                <ShareIcon className="h-3.5 w-3.5" />
                <span>{isPrivate ? 'Save to Vault' : 'Publish'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Viewport */}
      <div>
        <ImagePreview
          image={image}
          loading={loading}
          jobState={jobState}
          onOpenStoryExport={() => setShowStoryExport(true)}
        />
      </div>

      {showStoryExport && image && (
        <StoryExportModal
          image={image}
          prompt={prompt}
          author={name}
          onClose={() => setShowStoryExport(false)}
        />
      )}
    </motion.div>
  );
};

export default CreatePage;
