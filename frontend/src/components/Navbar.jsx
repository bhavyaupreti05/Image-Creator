import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          AI Image Creator
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">
            Home
          </Link>
          <Link to="/create" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
            Create
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
