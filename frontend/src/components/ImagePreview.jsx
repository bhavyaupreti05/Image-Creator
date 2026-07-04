const ImagePreview = ({ image, loading }) => {
  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-white/20 bg-slate-900/80 text-slate-400">
        Generating your image...
      </div>
    );
  }

  if (!image) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-white/20 bg-slate-900/80 text-slate-500">
        Your generated preview will appear here.
      </div>
    );
  }

  return (
    <img src={image} alt="Generated preview" className="h-[280px] w-full rounded-3xl object-cover shadow-2xl shadow-slate-950/30" />
  );
};

export default ImagePreview;
