figma.showUI(__html__, { width: 320, height: 270 });

let currentGradient: RGBA[] = [];

let notificationTimeout: number | null = null;

function debouncedNotify(message: string) {
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    notificationTimeout = setTimeout(() => {
        figma.notify(message);
        notificationTimeout = null;
    }, 300); // 300ms debounce time
}

figma.ui.onmessage = msg => {
    if (msg.type === 'generate-gradient') {
        const style = msg.style;
        currentGradient = generateRandomGradient(style);
        
        // Convert RGBA to CSS-friendly color strings
        const color1 = rgbaToCss(currentGradient[0]);
        const color2 = rgbaToCss(currentGradient[1]);

        // Send colors to the UI to update the preview
        figma.ui.postMessage({
            type: 'update-gradient-preview',
            colors: [color1, color2]
        });
    }

    if (msg.type === 'apply-gradient') {
        const selection = figma.currentPage.selection;

        if (selection.length > 0) {
            const selectedLayer = selection[0];

            if ("fills" in selectedLayer && currentGradient.length > 0) {
                selectedLayer.fills = [{
                    type: 'GRADIENT_LINEAR',
                    gradientStops: [
                        { color: currentGradient[0], position: 0, boundVariables: {} },
                        { color: currentGradient[1], position: 1, boundVariables: {} }
                    ],
                    gradientTransform: [
                        [1, 0, 0],
                        [0, 1, 0]
                    ]
                }];
            } 
        } 
    }
};

// Function to generate a random gradient based on the selected style
function generateRandomGradient(style: string): Array<RGBA> {
    let colors: Array<RGBA> = [];

    switch (style) {
        case 'Bright':
            colors = [
                randomColor({ r: 0.7, g: 0.3, b: 0.3 }),
                randomColor({ r: 0.7, g: 0.7, b: 0.3 })
            ];
            break;
        case 'Pop':
            colors = [
                randomColor({ r: 0.3, g: 0.3, b: 0.7 }),
                randomColor({ r: 0.7, g: 0.3, b: 0.7 })
            ];
            break;
        case 'Funk':
            colors = [
                randomColor({ r: 0.3, g: 0.7, b: 0.3 }),
                randomColor({ r: 0.7, g: 0.7, b: 0.3 })
            ];
            break;
        case 'Light':
            colors = [
                randomColor({ r: 0.9, g: 0.9, b: 0.9 }),
                randomColor({ r: 0.7, g: 0.7, b: 0.7 })
            ];
            break;
        case 'Dark':
            colors = [
                randomColor({ r: 0.2, g: 0.2, b: 0.2 }),
                randomColor({ r: 0.4, g: 0.4, b: 0.4 })
            ];
            break;
        case 'Saturated':
            colors = [
                randomColor({ r: 1, g: 0.2, b: 0.2 }),
                randomColor({ r: 0.2, g: 1, b: 0.2 })
            ];
            break;
    }

    return colors;
}

// Helper function to generate a random color with a base RGB value
function randomColor(base: { r: number, g: number, b: number }): RGBA {
    return {
        r: Math.min(1, base.r + Math.random() * 0.3),
        g: Math.min(1, base.g + Math.random() * 0.3),
        b: Math.min(1, base.b + Math.random() * 0.3),
        a: 1
    };
}

// Helper function to convert RGBA to CSS color string
function rgbaToCss(color: RGBA): string {
    return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;
}