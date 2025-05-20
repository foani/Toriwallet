const path = require('path');

// 프로젝트 루트 디렉토리
const rootDir = path.resolve(__dirname, '../../');

module.exports = {
  // 소스 코드 디렉토리
  src: path.resolve(rootDir, 'src'),
  
  // 정적 파일 디렉토리
  public: path.resolve(rootDir, 'public'),
  
  // 빌드 출력 디렉토리
  build: path.resolve(rootDir, 'dist'),
  
  // 노드 모듈 디렉토리
  nodeModules: path.resolve(rootDir, 'node_modules')
};
