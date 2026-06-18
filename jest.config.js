module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: [
    '**/__tests__/**/*.?([mc])[jt]s?(x)',
    '**/?(*.)+(spec|test).?([mc])[jt]s?(x)',
    '**/test_*.ts',
  ],
  moduleNameMapper: {
    // Esto ayuda si usas alias en tus rutas
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
