/**
 * exFAT 드라이브에서 fs.readlink가 EISDIR을 반환하는 문제 수정.
 * exFAT는 심볼릭 링크를 지원하지 않아 readlink가 EINVAL 대신 EISDIR를 반환함.
 * webpack enhanced-resolve는 EINVAL을 기대하므로 EISDIR → EINVAL로 변환.
 */
const fs = require('fs');

// 비동기 readlink 패치
const _readlink = fs.readlink.bind(fs);
fs.readlink = function patchedReadlink(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  _readlink(path, options, (err, linkString) => {
    if (err && err.code === 'EISDIR') {
      const newErr = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      newErr.code = 'EINVAL';
      newErr.syscall = 'readlink';
      newErr.path = path;
      callback(newErr);
    } else {
      callback(err, linkString);
    }
  });
};

// 동기 readlinkSync 패치
const _readlinkSync = fs.readlinkSync.bind(fs);
fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return _readlinkSync(path, options);
  } catch (e) {
    if (e && e.code === 'EISDIR') {
      const newErr = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      newErr.code = 'EINVAL';
      newErr.syscall = 'readlink';
      newErr.path = path;
      throw newErr;
    }
    throw e;
  }
};
