const KEY = 'compareList';

export const getCompareList = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
};

export const addToCompare = (anunt) => {
    const list = getCompareList();
    if (list.length >= 3 || list.find(a => a.id === anunt.id)) return false;
    list.push(anunt);
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('compareUpdated'));
    return true;
};

export const removeFromCompare = (id) => {
    const list = getCompareList().filter(a => a.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('compareUpdated'));
};

export const clearCompare = () => {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event('compareUpdated'));
};

export const isInCompare = (id) => getCompareList().some(a => a.id === id);
