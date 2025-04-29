import { BREAK } from 'lo';
import { File } from './lib/file.js';
import { FileResolver } from './lib/resolver.js';
import { FileError, NotFoundError, NotResolvedError, WalkError } from './lib/util.js';
import { Walk } from './lib/walk.js';

const walk = Walk.factory();
const sync = Walk.factory(true);

export {
    BREAK,
    File,
    FileError,
    FileResolver,
    NotFoundError,
    NotResolvedError,
    sync,
    Walk,
    walk,
    WalkError
};

export default walk;
