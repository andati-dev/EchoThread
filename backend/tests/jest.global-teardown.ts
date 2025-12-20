import fs from 'fs';
export default async function globalTeardown() {
  // remove test DB file
  try { fs.unlinkSync('./test.db') } catch (e) {}
}
