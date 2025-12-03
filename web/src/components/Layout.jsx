import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Search, Github } from 'lucide-react';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="glass-panel sticky top-4 z-50 mx-4 mt-4 mb-8 px-6 py-4 flex items-center justify-between max-w-7xl xl:mx-auto w-full">
                <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 hover:opacity-80 transition-opacity">
                    EVERSE TechRadar
                </Link>

                <nav className="flex items-center gap-6">
                    <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Tools
                    </Link>
                    <Link to="/dimensions" className="text-slate-600 hover:text-slate-900 transition-colors">
                        Dimensions
                    </Link>
                    <a
                        href="https://github.com/everse/catalog-explorer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    >
                        <Github size={20} />
                    </a>
                </nav>
            </header>

            <main className="flex-1 container px-4 pb-12">
                <Outlet />
            </main>

            <footer className="mt-auto py-8 text-center text-slate-500 text-sm">
                <p>© {new Date().getFullYear()} EVERSE. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
