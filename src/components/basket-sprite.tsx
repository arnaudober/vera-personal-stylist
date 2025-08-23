import * as React from "react";

// Basket sprite component to handle empty vs full basket
export function BasketSprite({isEmpty}: { isEmpty: boolean }) {
    const style: React.CSSProperties = {
        width: '100%',
        aspectRatio: '1/2',
        backgroundImage: 'url(/assets/basket-grid.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '200% 100%',
        backgroundPosition: isEmpty ? '0 0' : '94% 0', // Full basket is to the right
        imageRendering: 'auto',
    };

    return (<div
            style={style}
            aria-label={isEmpty ? "Empty basket" : "Full basket"}
        />);
}