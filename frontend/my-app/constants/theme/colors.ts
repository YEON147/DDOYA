export const colors = {
    background: '#F5F6F7',
    surface: '#FFFFFF',
    input: '#F5F6F7',
    border: '#E5E7EB',
    text: '#FF8A15',
    primary: '#FF8A15',
} as const

export type ColorToken = keyof typeof colors