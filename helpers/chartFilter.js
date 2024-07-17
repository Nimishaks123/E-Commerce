const getStartDate = (interval) => {
    const now = new Date();
    let startDate;

    switch (interval) {
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'weekly':
        default:
            const startOfWeek = now.getDate() - now.getDay();
            startDate = new Date(now.setDate(startOfWeek));
            break;
    }

    return startDate;
};

module.exports = getStartDate;

