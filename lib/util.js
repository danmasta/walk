import { BaseError, NotFoundError, NotResolvedError } from 'lo/errors';
import { normalize } from 'node:path';

export class WalkError extends BaseError {
    static code = 'ERR_WALK';
}

export class FileError extends Error {
    static code = 'ERR_FILE';
}

export function stripStartingSep (str='') {
    return normalize(str).replace(/^[\\/]+/, '');
}

export function stripTrailingSep (str='') {
    return normalize(str).replace(/[\\/]+$/, '');
}

export {
    NotFoundError,
    NotResolvedError
};
