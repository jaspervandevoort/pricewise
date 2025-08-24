// Ik weet niet als dit een goede oplossing is maar momenteel werkt de app niet voor europese nummer notatie


export const parseEuropeanNumber = (value: string): number => {
    // komma naar punt vervangen voor decimaal
    const normalizedValue = value.replace(',', '.');
    return parseFloat(normalizedValue);
};

export const formatEuropeanPrice = (price: number): string => {
    // formatteer als euro prijs met komma als decimaal scheiding
    return `€${price.toFixed(2).replace('.', ',')}`;
};

export const isValidEuropeanNumber = (value: string): boolean => {
    // toelaten dat er een komma of punt is voor decimalen
    const normalizedValue = value.replace(',', '.');
    const number = parseFloat(normalizedValue);
    return !isNaN(number) && number > 0;
};