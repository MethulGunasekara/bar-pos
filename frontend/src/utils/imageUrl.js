export const API_BASE_URL = 'http://localhost:5000';

export const getImageUrl = (relativePath) => {
    if (!relativePath) return '';
    return `${API_BASE_URL}${relativePath}`;
};