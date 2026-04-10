/** 네트워크 연결 문제 (인터넷 끊김 등) */
export class NetworkError extends Error {
  constructor() {
    super('네트워크 연결을 확인해주세요.');
    this.name = 'NetworkError';
  }
}

/** Supabase 서비스 자체 오류 (5xx) */
export class ServiceError extends Error {
  constructor() {
    super('서비스에 일시적인 문제가 발생했어요.');
    this.name = 'ServiceError';
  }
}
