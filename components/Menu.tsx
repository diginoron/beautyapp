import React from 'react';
import { HomeIcon, CloseIcon } from './icons';

interface MenuProps {
    isOpen: boolean;
    onClose: () => void;
    onGoHome: () => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onGoHome }) => {
    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Menu Panel */}
            <div 
                className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="menu-title"
            >
                <div className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 id="menu-title" className="text-lg font-semibold text-slate-800">
                            منو
                        </h2>
                         <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors" aria-label="بستن منو">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <nav className="flex-grow">
                        <ul>
                            <li className="mb-4">
                                <button
                                    onClick={() => {
                                        onGoHome();
                                        onClose();
                                    }}
                                    className="w-full flex items-center p-2 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                    <HomeIcon className="w-5 h-5 ml-3" />
                                    <span>صفحه نخست</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Menu;