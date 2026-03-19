export const colors = {
    background: '#FFFEF9',
    surface: '#FFF7E6',
    input: '#F5F6F7',
    dark: '#3F2207',
    text: '#000000',
    primary: '#FF8A15',
    point: '#FF8B1F',
} as const

export type ColorToken = keyof typeof colors