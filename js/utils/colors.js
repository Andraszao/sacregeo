export const getColor = (sides) => {
    const colors = {
        3: 0x00ffff,  // Cyan
        4: 0xff00ff,  // Magenta
        5: 0xffff00,  // Yellow
        6: 0xffffff   // White
    };
    return colors[sides] || colors[3];
};

export const colorToVector = (color) => {
    const c = new THREE.Color(color);
    return new THREE.Vector3(c.r, c.g, c.b);
};
