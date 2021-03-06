const MAJOR = 0;
const MINOR = 0;
const REVISION = 1;

export default {
  toString(): string {
    return `${MAJOR}.${MINOR}.${REVISION}`;
  },
  MAJOR,
  MINOR,
  REVISION,
  APPNAME: 'Purpurina',
  STAGE: 'Alpha',
};
