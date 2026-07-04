import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import PromptInput from '../components/PromptInput';
import ImagePreview from '../components/ImagePreview';
import { createPost, generateImage } from '../services/postService';

const randomPrompts = [
  'A neon-lit cyberpunk street in a rain-soaked futuristic city',
  'A peaceful fantasy forest with glowing mushrooms and a moonlit stream',
  'An astronaut walking on a vibrant alien planet at sunrise',
  'A cozy bookstore on a misty evening with warm golden lights',
];

const CreatePage = () => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

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
    try {
      const result = await generateImage(prompt.trim());
      setImage(result.photo);
      toast.success('Image generated successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!name.trim() || !prompt.trim() || !image) {
      toast.error('Please provide your name, prompt, and generated image.');
      return;
    }

    try {
      await createPost({ name: name.trim(), prompt: prompt.trim(), photo: image });
      toast.success('Post shared to the community');
      setName('');
      setPrompt('');
      setImage('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to share post');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-7 shadow-[0_20px_80px_rgba(2,8,23,0.28)]">
        <h2 className="text-3xl font-semibold text-white">Create your image</h2>
        <p className="mt-3 text-slate-400">Describe a concept, generate a visual, and share it with the community.</p>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Your name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Enter your name" />
          </div>
          <PromptInput value={prompt} onChange={setPrompt} onRandomize={handleRandomPrompt} />
          <div className="flex flex-wrap gap-3">
            <button onClick={handleGenerate} disabled={loading} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Generating...' : 'Generate Image'}
            </button>
            <button onClick={handleShare} className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
              Share with Community
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-7 shadow-[0_20px_80px_rgba(2,8,23,0.28)]">
        <h3 className="text-2xl font-semibold text-white">Preview</h3>
        <div className="mt-6">
          <ImagePreview image={image} loading={loading} />
        </div>
      </div>
    </motion.div>
  );
};

export default CreatePage;
