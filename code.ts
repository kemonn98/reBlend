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

        if (selection.length > 0 && currentGradient.length > 0) {
            // Loop through all selected layers
            for (const selectedLayer of selection) {
                if ("fills" in selectedLayer && Array.isArray(selectedLayer.fills)) {
                    let gradientFill = selectedLayer.fills.find((fill: Paint) => fill.type === 'GRADIENT_LINEAR') as GradientPaint | undefined;
                    
                    if (gradientFill) {
                        // Modify existing gradient fill
                        selectedLayer.fills = selectedLayer.fills.map(fill => {
                            if (fill.type === 'GRADIENT_LINEAR') {
                                return {
                                    ...fill,
                                    gradientStops: [
                                        { color: currentGradient[0], position: 0, boundVariables: {} },
                                        { color: currentGradient[1], position: 1, boundVariables: {} }
                                    ]
                                };
                            }
                            return fill;
                        });
                    } else {
                        // Create new gradient fill
                        const newGradientFill: GradientPaint = {
                            type: 'GRADIENT_LINEAR',
                            gradientStops: [
                                { color: currentGradient[0], position: 0, boundVariables: {} },
                                { color: currentGradient[1], position: 1, boundVariables: {} }
                            ],
                            gradientTransform: [
                                [1, 0, 0],
                                [0, 1, 0]
                            ]
                        };
                        selectedLayer.fills = [newGradientFill];
                    }
                }
            }
        } else {
            figma.notify('Please select one or more objects.');
        }
    }
};


// Function to generate a random gradient based on the selected style
function generateRandomGradient(style: string): Array<RGBA> {
    let colors: Array<RGBA> = [];

    switch (style) {
        case 'Vibrant':
            colors = [
                randomColor({ r: Math.random(), g: Math.random() * 0.8, b: Math.random() * 0.8 }),
                randomColor({ r: Math.random() * 0.8, g: Math.random(), b: Math.random() * 0.8 }),
                randomColor({ r: Math.random() * 0.8, g: Math.random() * 0.8, b: Math.random() })
            ];
            break;

        case 'Warm':
            colors = [
                randomColor({ r: 1, g: 0.5, b: 0.2 }), // Orange
                randomColor({ r: 1, g: 0.3, b: 0.3 })  // Warm red
            ];
            break;

        case 'Cool':
            colors = [
                randomColor({ r: 0.2, g: 0.6, b: 1 }), // Cool blue
                randomColor({ r: 0.2, g: 1, b: 0.8 })  // Teal
            ];
            break;

        case 'Neutral':
            colors = [
                randomColor({ r: 0.8, g: 0.8, b: 0.8 }), // Light gray
                randomColor({ r: 0.4, g: 0.4, b: 0.4 })  // Dark gray
            ];
            break;

        case 'Complementary':
            const baseColor1 = randomColor({ r: Math.random(), g: Math.random(), b: Math.random() });
            const complementaryColor1 = randomColor({
                r: 1 - baseColor1.r, 
                g: 1 - baseColor1.g, 
                b: 1 - baseColor1.b
            });
            
            const baseColor2 = randomColor({ r: Math.random(), g: Math.random(), b: Math.random() });
            const complementaryColor2 = randomColor({
                r: 1 - baseColor2.r, 
                g: 1 - baseColor2.g, 
                b: 1 - baseColor2.b
            });
        
            // Randomly mix two base colors and their complementary counterparts
            colors = [
                baseColor1, 
                complementaryColor1,
                baseColor2,
                complementaryColor2
            ];
            break;

        case 'Pastel':
            colors = [
                randomColor({ r: 1, g: 0.7, b: 0.7 }), // Pastel pink
                randomColor({ r: 0.7, g: 1, b: 0.7 })  // Pastel green
            ];
            break;

        case 'Muted':
            colors = [
                randomColor({ r: 0.6, g: 0.6, b: 0.4 }), // Muted yellow-green
                randomColor({ r: 0.4, g: 0.5, b: 0.5 })  // Muted teal
            ];
            break;

        case 'Grayscale':
            const grayValue1 = Math.random(); // Random value between 0 and 1
            const grayValue2 = Math.random(); // Another random value between 0 and 1
            colors = [
                { r: grayValue1, g: grayValue1, b: grayValue1, a: 1 },  // First grayscale color
                { r: grayValue2, g: grayValue2, b: grayValue2, a: 1 }   // Second grayscale color
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