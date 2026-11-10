import { query } from '../config/db.js';
import asyncHandler from './asyncHandler.js';
import ApiError from './ApiError.js';
import paginate from './pagination.js';

const clean = (v) => (typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : v);

/**
 * Builds list / getOne / create / update / remove handlers for a table.
 * Remove = soft delete (IsActive = 0) so history is never lost.
 */
export default ({
  table, alias, pk, fields, required = [], selectCols, joins = '',
  searchFields = [], filters = {}, orderBy, extraWhere, transform,
}) => {
  const out = (row, req) => (transform && row ? transform(row, req) : row);
  const pick = (body) => {
    const data = {};
    fields.forEach((f) => { if (body[f] !== undefined) data[f] = clean(body[f]); });
    return data;
  };
  const assertRequired = (data, isUpdate) => {
    required.forEach((f) => {
      if ((!isUpdate || f in data) && (data[f] === undefined || data[f] === null || data[f] === '')) {
        throw new ApiError(422, `${f} is required`);
      }
    });
  };

  const list = asyncHandler(async (req, res) => {
    const { page, pageSize, offset } = paginate(req);
    const where = ['1=1'];
    const params = {};
    if (req.query.search && searchFields.length) {
      where.push(`(${searchFields.map((f) => `${f} LIKE @search`).join(' OR ')})`);
      params.search = `%${req.query.search}%`;
    }
    Object.entries(filters).forEach(([key, col]) => {
      const v = req.query[key];
      if (v !== undefined && v !== '') { where.push(`${col} = @${key}`); params[key] = v; }
    });
    if (extraWhere) {
      const extra = extraWhere(req);
      if (extra) { where.push(extra.sql); Object.assign(params, extra.params || {}); }
    }
    const base = `FROM ${table} ${alias} ${joins} WHERE ${where.join(' AND ')}`;
    const total = (await query(`SELECT COUNT(*) AS total ${base}`, params)).recordset[0].total;
    const paging = req.query.all === '1' ? '' : 'OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY';
    const data = (await query(`SELECT ${selectCols} ${base} ORDER BY ${orderBy} ${paging}`, { ...params, offset, pageSize })).recordset;
    res.json({ data: data.map((r) => out(r, req)), total, page, pageSize });
  });

  const findOne = async (id) => {
    const r = await query(`SELECT ${selectCols} FROM ${table} ${alias} ${joins} WHERE ${alias}.${pk} = @id`, { id });
    return r.recordset[0];
  };

  const getOne = asyncHandler(async (req, res) => {
    const row = await findOne(req.params.id);
    if (!row) throw new ApiError(404, 'Record not found');
    res.json(out(row, req));
  });

  const insert = async (data) => {
    const cols = Object.keys(data);
    const r = await query(
      `INSERT INTO ${table} (${cols.join(',')}) OUTPUT INSERTED.${pk} AS id VALUES (${cols.map((c) => `@${c}`).join(',')})`,
      data
    );
    return r.recordset[0].id;
  };

  const create = asyncHandler(async (req, res) => {
    const data = pick(req.body);
    assertRequired(data, false);
    const id = await insert(data);
    res.status(201).json(out(await findOne(id), req));
  });

  const update = asyncHandler(async (req, res) => {
    const data = pick(req.body);
    assertRequired(data, true);
    const cols = Object.keys(data);
    if (!cols.length) throw new ApiError(422, 'Nothing to update');
    const r = await query(
      `UPDATE ${table} SET ${cols.map((c) => `${c} = @${c}`).join(',')} WHERE ${pk} = @id`,
      { ...data, id: req.params.id }
    );
    if (!r.rowsAffected[0]) throw new ApiError(404, 'Record not found');
    res.json(out(await findOne(req.params.id), req));
  });

  const remove = asyncHandler(async (req, res) => {
    const r = await query(`UPDATE ${table} SET IsActive = 0 WHERE ${pk} = @id`, { id: req.params.id });
    if (!r.rowsAffected[0]) throw new ApiError(404, 'Record not found');
    res.json({ message: 'Record deactivated' });
  });

  return { list, getOne, create, update, remove, findOne, insert, pick, assertRequired };
};
