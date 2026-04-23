import React from 'react';

const Header = () => {
    return (
        <header className="bg-brand-red py-4 px-10 flex justify-start items-center shadow-lg sticky top-0 z-50">
            <h1 className="text-3xl font-logo text-white tracking-widest select-none cursor-default uppercase">
                Bloque Mundo
            </h1>
        </header>
    );
};

export default Header;