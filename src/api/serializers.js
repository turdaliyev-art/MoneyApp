const getCurrentUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("pn_user") || "null")?.id || null;
  } catch {
    return null;
  }
};

const withUserId = (payload) => ({
  ...payload,
  user_id: getCurrentUserId(),
});

export const filterByCurrentUser = (items) => {
  const currentUserId = getCurrentUserId();
  return items.filter((item) => String(item.userId ?? item.user_id) === String(currentUserId));
};

const normalizeCommon = (item) => ({
  ...item,
  userId: item.user_id ?? item.userId,
  createdAt: item.created_at || item.createdAt,
  updatedAt: item.updated_at || item.updatedAt,
});

export const normalizeWallet = (item) => normalizeCommon({
  ...item,
  userId: item.user_id ?? item.userId,
  type: item.type?.toLowerCase(),
});

export const serializeWallet = (form) => withUserId({
  name: form.name,
  balance: Number(form.balance) || 0,
  type: form.type.toUpperCase(),
});

export const normalizeCategory = (item) => normalizeCommon({
  ...item,
  userId: item.user_id ?? item.userId,
  type: item.type?.toLowerCase(),
});

export const serializeCategory = (form) => withUserId({
  name: form.name,
  type: form.type.toUpperCase(),
  icon: form.icon,
  color: form.color,
});

export const normalizeTransaction = (item) => normalizeCommon({
  ...item,
  userId: item.user_id ?? item.userId,
  walletId: item.wallet_id ?? item.walletId,
  categoryId: item.category_id ?? item.categoryId,
  description: item.note ?? item.description,
  date: item.date || item.created_at || item.createdAt,
  type: item.type?.toLowerCase(),
});

export const serializeTransaction = (form) => withUserId({
  wallet_id: form.walletId ? Number(form.walletId) : null,
  category_id: form.categoryId ? Number(form.categoryId) : null,
  amount: Number(form.amount),
  type: form.type.toUpperCase(),
  note: form.description || "",
});

export const normalizeBudget = (item) => normalizeCommon({
  ...item,
  userId: item.user_id ?? item.userId,
  categoryId: item.category_id ?? item.categoryId,
  limit: item.amount_limit ?? item.limit ?? item.amount,
  period: item.period || "monthly",
});

export const serializeBudget = (form) => {
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const year = new Date(now.getFullYear(), 0, 1).toISOString();

  return withUserId({
    category_id: form.categoryId ? Number(form.categoryId) : null,
    amount_limit: Number(form.limit),
    period: form.period || "monthly",
    month,
    year,
  });
};

export const normalizeDebt = (item) => normalizeCommon({
  ...item,
  userId: item.user_id ?? item.userId,
  personName: item.person_name ?? item.personName,
  dueDate: item.due_date || item.dueDate,
  type: item.type?.toLowerCase() === "given" ? "lent" : "borrowed",
  status: item.status?.toLowerCase(),
});

export const serializeDebt = (form) => withUserId({
  person_name: form.personName,
  amount: Number(form.amount),
  type: form.type === "lent" ? "GIVEN" : "TAKEN",
  due_date: form.dueDate || null,
  status: form.status.toUpperCase(),
  note: form.note || "",
});

export const normalizeGoal = (item) => normalizeCommon({
  ...item,
  userId: item.user_id ?? item.userId,
  walletId: item.wallet_id ?? item.walletId,
  name: item.title ?? item.name,
  targetAmount: item.target_amount ?? item.targetAmount,
  currentAmount: item.current_amount ?? item.currentAmount,
  status: item.status?.toLowerCase(),
});

export const serializeGoal = (form) => withUserId({
  wallet_id: form.walletId ? Number(form.walletId) : null,
  title: form.name,
  target_amount: Number(form.targetAmount),
  current_amount: Number(form.currentAmount) || 0,
  deadline: form.deadline || null,
  status: Number(form.currentAmount) >= Number(form.targetAmount) ? "COMPLETED" : "IN_PROGRESS",
});

export const serializeUser = (data) => ({
  ...(data.name !== undefined ? { name: data.name } : { name: data.fullName }),
  ...(data.email !== undefined ? { email: data.email } : {}),
  ...(data.password !== undefined ? { password: data.password } : {}),
  ...(data.currentPassword !== undefined ? { current_password: data.currentPassword } : {}),
  ...(data.currency !== undefined ? { currency: data.currency } : {}),
});

export const normalizeUser = (item) => ({
  ...item,
  fullName: item.fullName || item.name,
});