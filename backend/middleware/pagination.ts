/**
 * Backend Pagination Middleware
 * Express middleware for handling pagination
 */

import { NextFunction, Request, Response } from 'express';

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * Parse pagination parameters from request
 */
export function parsePaginationParams(req: Request): PaginationParams {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const sort = req.query.sort as string || 'createdAt';
    const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    return { page, limit, skip, sort, order };
}

/**
 * Pagination middleware - adds pagination params to request
 */
export function paginationMiddleware(req: Request, res: Response, next: NextFunction) {
    req.pagination = parsePaginationParams(req);
    next();
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / params.limit);
    const hasNext = params.page < totalPages;
    const hasPrev = params.page > 1;

    return {
        success: true,
        data,
        pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages,
            hasNext,
            hasPrev,
        },
    };
}

/**
 * Mongoose pagination helper
 */
export async function paginateMongoose<T>(
    model: any,
    query: any,
    params: PaginationParams,
    populate?: string | string[]
): Promise<PaginatedResponse<T>> {
    const sortObj: any = {};
    sortObj[params.sort || 'createdAt'] = params.order === 'asc' ? 1 : -1;

    let queryBuilder = model
        .find(query)
        .sort(sortObj)
        .skip(params.skip)
        .limit(params.limit);

    if (populate) {
        if (Array.isArray(populate)) {
            populate.forEach(p => {
                queryBuilder = queryBuilder.populate(p);
            });
        } else {
            queryBuilder = queryBuilder.populate(populate);
        }
    }

    const [data, total] = await Promise.all([
        queryBuilder.exec(),
        model.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, params);
}

/**
 * Array pagination helper (for in-memory data)
 */
export function paginateArray<T>(
    array: T[],
    params: PaginationParams
): PaginatedResponse<T> {
    const total = array.length;
    const start = params.skip;
    const end = start + params.limit;
    const data = array.slice(start, end);

    return createPaginatedResponse(data, total, params);
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            pagination?: PaginationParams;
        }
    }
}
