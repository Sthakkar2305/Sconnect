import React from 'react';

type NavbarProps = {
    onNavClick: (section: string) => void;
};

export function Navbar({ onNavClick }: NavbarProps) {

    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        section: string
    ) => {
        e.preventDefault(); // Stop the browser from navigating
        onNavClick(section); // Call the function from StreetScene
    };

    return (
        <nav
            className="fixed top-0 left-0 w-full bg-black bg-opacity-50 text-white 
                 flex justify-between items-center p-4 z-50"
        // z-50 ensures it stays on top of all other elements, including your 3D text
        >
            {/* Left Side: Logo/Brand */}
            <div className="text-2xl font-bold">
                <a href="/" onClick={(e) => handleClick(e, 'home')}>
                    S-CONNECT
                </a>
            </div>

            <div className="flex items-center space-x-6">
                <a
                    href="/"
                    className="hover:text-gray-300"
                    onClick={(e) => handleClick(e, 'home')}
                >
                    Home
                </a>
                <a
                    href="/about"
                    className="hover:text-gray-300"
                    onClick={(e) => handleClick(e, 'about')}
                >
                    About
                </a>
                <a
                    href="/projects"
                    className="hover:text-gray-300"
                    onClick={(e) => handleClick(e, 'projects')}
                >
                    Projects
                </a>
                <a
                    href="/contact"
                    className="hover:text-gray-300"
                    onClick={(e) => handleClick(e, 'contact')}
                >
                    Contact
                </a>

                <a
                    href="#"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={(e) => handleClick(e, 'start')}
                >
                    Start
                </a>
            </div>
        </nav>
    );
}