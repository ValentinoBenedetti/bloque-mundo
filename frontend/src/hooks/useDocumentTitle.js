import { useEffect } from 'react';

const useDocumentTitle = (title) => {
    useEffect(() => {
        const defaultTitle = 'Bloque Mundo';
        if (title) {
            document.title = `${title} | ${defaultTitle}`;
        } else {
            document.title = defaultTitle;
        }

        // Cleanup on unmount (optional, but good practice if we want to revert)
        return () => {
            document.title = defaultTitle;
        };
    }, [title]);
};

export default useDocumentTitle;
