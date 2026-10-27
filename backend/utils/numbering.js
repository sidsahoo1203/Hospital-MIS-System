// Next number like "MT-2026-00042", continuing from the highest one issued
// this year (zero padding keeps string order equal to numeric order).
export const nextNumber = async (Model, field, prefix) => {
  const yearPrefix = `${prefix}-${new Date().getFullYear()}-`;
  const latest = await Model.findOne({ [field]: { $regex: `^${yearPrefix}` } })
    .sort({ [field]: -1 })
    .select(field)
    .lean();
  const value = latest ? field.split(".").reduce((o, k) => o?.[k], latest) : null;
  const last = value ? Number(value.slice(yearPrefix.length)) : 0;
  return `${yearPrefix}${String(last + 1).padStart(5, "0")}`;
};
