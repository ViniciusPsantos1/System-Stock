// ============================================================
// JC Eletrodiesel — Sistema de Estoque
// app.js migrado de localStorage → Supabase
// ============================================================

// CONFIG: cole aqui sua URL e chave anon do projeto Supabase
const SUPABASE_URL = 'https://lzrjikaunrgazebbquym.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4LG_gdB9tdb5V_l5a2cl8A_lcQvJv6I';

// Cliente Supabase (carregado via CDN no index.html)
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Estado global da aplicação
let products = [];
let suppliers = [];
let categories = [];
let transactions = [];
let settings = { companyName: 'JC Eletrodiesel', currency: 'R$', customTheme: 'dark' };

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initClock();
  initNavigation();
  initEventListeners();
  await loadAll();
  renderDashboard();
});

async function loadAll() {
  showLoadingOverlay(true);
  try {
    await Promise.all([
      loadSettings(),
      loadCategories(),
      loadSuppliers(),
      loadProducts(),
      loadTransactions(),
    ]);
  } catch (err) {
    showToast('Erro de Conexão', 'Não foi possível carregar os dados do servidor.', 'danger');
    console.error(err);
  } finally {
    showLoadingOverlay(false);
  }
}

// ============================================================
// LOADING OVERLAY
// ============================================================
function showLoadingOverlay(show) {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.5);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;font-size:1rem;color:#fff;gap:12px;
    `;
    overlay.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Carregando...';
    document.body.appendChild(overlay);
  }
  overlay.style.display = show ? 'flex' : 'none';
}

// ============================================================
// LOADERS — leitura do Supabase
// ============================================================
async function loadSettings() {
  const { data } = await db.from('settings').select('*').eq('id', 1).single();
  if (data) {
    settings = {
      companyName: data.company_name,
      currency: data.currency,
      customTheme: data.custom_theme,
      lowStockAlert: data.low_stock_alert,
    };
    applyTheme(settings.customTheme);
  }
}

async function loadCategories() {
  const { data } = await db.from('categorias').select('*').order('nome');
  categories = data || [];
}

async function loadSuppliers() {
  const { data } = await db.from('fornecedores').select('*').order('nome');
  // Mapear colunas do banco → nomes que o app usa internamente
  suppliers = (data || []).map(mapSupplier);
}

async function loadProducts() {
  const { data } = await db.from('vw_produtos').select('*').order('nome');
  products = (data || []).map(mapProduct);
}

async function loadTransactions() {
  const { data } = await db.from('vw_movimentacoes').select('*').order('data', { ascending: false });
  transactions = (data || []).map(mapTransaction);
}

// ============================================================
// MAPPERS — banco → formato interno do app
// ============================================================
function mapProduct(row) {
  return {
    id: row.id,
    name: row.nome,
    sku: row.sku,
    category: row.categoria || 'Outros',
    categoriaId: row.categoria_id,
    priceCost: parseFloat(row.preco_custo) || 0,
    priceSell: parseFloat(row.preco_venda) || 0,
    quantity: parseFloat(row.quantidade) || 0,
    minQuantity: parseFloat(row.quantidade_min) || 5,
    supplierId: row.fornecedor_id || '',
    supplierName: row.fornecedor || '',
    description: row.descricao || '',
    localizacao: row.localizacao || '',
    color: row.cor || '#6366f1',
    status: row.status_estoque,
  };
}

function mapSupplier(row) {
  return {
    id: row.id,
    name: row.nome,
    contactName: row.nome_contato || '',
    document: row.documento || '',
    phone: row.telefone || '',
    email: row.email || '',
    address: row.endereco || '',
  };
}

function mapTransaction(row) {
  return {
    id: row.id,
    productId: row.produto_id,
    productName: row.produto_nome,
    productSku: row.produto_sku,
    type: row.tipo,
    quantity: parseFloat(row.quantidade),
    totalValue: parseFloat(row.valor_total) || 0,
    unitPrice: parseFloat(row.valor_unitario) || 0,
    date: row.data,
    reason: row.motivo,
  };
}

// ============================================================
// TOAST
// ============================================================
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: 'fa-circle-check', warning: 'fa-triangle-exclamation', danger: 'fa-circle-xmark', info: 'fa-circle-info' };
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;
  container.appendChild(toast);
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4500);
}

function formatCurrency(value) {
  const symbol = settings.currency || 'R$';
  return `${symbol} ${parseFloat(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================================
// TEMA
// ============================================================
function initTheme() {
  const btn = document.getElementById('theme-toggle-button');
  const icon = document.getElementById('theme-icon');
  const span = btn?.querySelector('span');

  function applyAndSave(theme) {
    applyTheme(theme);
    settings.customTheme = theme;
    db.from('settings').update({ custom_theme: theme }).eq('id', 1);
    if (document.getElementById('view-dashboard').classList.contains('active')) renderDashboard();
  }

  applyTheme(settings.customTheme || 'dark');

  btn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyAndSave(current === 'dark' ? 'light' : 'dark');
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme || 'dark');
  const btn = document.getElementById('theme-toggle-button');
  const icon = document.getElementById('theme-icon');
  const span = btn?.querySelector('span');
  if (theme === 'dark') {
    if (icon) icon.className = 'fa-solid fa-sun';
    if (span) span.textContent = 'Modo Claro';
  } else {
    if (icon) icon.className = 'fa-solid fa-moon';
    if (span) span.textContent = 'Modo Escuro';
  }
}

// ============================================================
// RELÓGIO
// ============================================================
function initClock() {
  const el = document.getElementById('live-clock');
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  function tick() {
    const now = new Date();
    const d = now.toLocaleDateString('pt-BR', opts);
    const t = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (el) el.textContent = `${d.charAt(0).toUpperCase() + d.slice(1)} | ${t}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const viewPanes = document.querySelectorAll('.view-pane');
  const mainTitle = document.getElementById('main-view-title');
  const mainSubtitle = document.getElementById('main-view-subtitle');

  const pages = {
    'view-dashboard': { title: 'Dashboard', subtitle: 'Resumo estatístico do inventário' },
    'view-products': { title: 'Produtos', subtitle: 'Gerenciamento do catálogo de peças' },
    'view-transactions': { title: 'Movimentações de Estoque', subtitle: 'Histórico de entradas e saídas' },
    'view-suppliers': { title: 'Fornecedores', subtitle: 'Cadastro e dados dos fornecedores' },
    'view-categories': { title: 'Categorias de Produtos', subtitle: 'Gerenciamento de categorias' },
    'view-settings': { title: 'Configurações', subtitle: 'Opções de sistema e preferências' },
  };

  navLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      navLinks.forEach(n => n.classList.remove('active'));
      viewPanes.forEach(p => p.classList.remove('active'));
      link.classList.add('active');
      document.getElementById(target)?.classList.add('active');
      if (pages[target]) {
        mainTitle.textContent = pages[target].title;
        mainSubtitle.textContent = pages[target].subtitle;
      }
      if (target === 'view-dashboard') { await loadAll(); renderDashboard(); }
      if (target === 'view-products') { await loadProducts(); renderProducts(); }
      if (target === 'view-transactions') { await loadTransactions(); renderTransactions(); }
      if (target === 'view-suppliers') { await loadSuppliers(); renderSuppliers(); }
      if (target === 'view-categories') { await loadCategories(); renderCategories(); }
      if (target === 'view-settings') renderSettings();
    });
  });
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

// ============================================================
// EVENT LISTENERS
// ============================================================
function initEventListeners() {
  document.getElementById('btn-add-product')?.addEventListener('click', () => {
    document.getElementById('modal-product-title').textContent = 'Novo Produto';
    document.getElementById('form-product-id').value = '';
    document.getElementById('initial-stock-group').style.display = 'flex';
    document.getElementById('form-product').reset();
    populateCategoriesDropdown('prod-category-select');
    populateSuppliersDropdown('prod-supplier');
    openModal('modal-product');
  });

  document.getElementById('btn-add-supplier')?.addEventListener('click', () => {
    document.getElementById('modal-supplier-title').textContent = 'Novo Fornecedor';
    document.getElementById('form-supplier-id').value = '';
    document.getElementById('form-supplier').reset();
    openModal('modal-supplier');
  });

  const openTx = () => {
    document.getElementById('form-transaction').reset();
    populateProductsDropdown('tx-product-select');
    document.getElementById('tx-date').value = new Date().toISOString().slice(0, 16);
    document.getElementById('tx-unit-price-helper').textContent = 'Escolha um produto para ver os valores sugeridos.';
    openModal('modal-transaction');
  };
  document.getElementById('btn-add-transaction')?.addEventListener('click', openTx);
  document.getElementById('btn-quick-transaction')?.addEventListener('click', openTx);

  document.getElementById('btn-save-company-settings')?.addEventListener('click', saveCompanySettings);
  document.getElementById('btn-export-data')?.addEventListener('click', exportData);
  document.getElementById('btn-import-trigger')?.addEventListener('click', () => document.getElementById('import-data-file')?.click());
  document.getElementById('import-data-file')?.addEventListener('change', importData);
  document.getElementById('btn-reset-database')?.addEventListener('click', resetDatabase);

  document.getElementById('search-product-input')?.addEventListener('input', renderProducts);
  document.getElementById('filter-product-category')?.addEventListener('change', renderProducts);
  document.getElementById('filter-product-status')?.addEventListener('change', renderProducts);
  document.getElementById('search-transaction-input')?.addEventListener('input', renderTransactions);
  document.getElementById('filter-transaction-type')?.addEventListener('change', renderTransactions);
  document.getElementById('search-supplier-input')?.addEventListener('input', renderSuppliers);

  document.getElementById('btn-add-category')?.addEventListener('click', () => {
    document.getElementById('modal-category-title').textContent = 'Nova Categoria';
    document.getElementById('form-category-id').value = '';
    document.getElementById('form-category-callback').value = '';
    document.getElementById('form-category').reset();
    openModal('modal-category');
  });

  document.getElementById('btn-quick-add-category')?.addEventListener('click', () => {
    document.getElementById('modal-category-title').textContent = 'Nova Categoria (Criação Rápida)';
    document.getElementById('form-category-id').value = '';
    document.getElementById('form-category-callback').value = 'prod-category-select';
    document.getElementById('form-category').reset();
    openModal('modal-category');
  });

  document.getElementById('search-category-input')?.addEventListener('input', renderCategories);
}

// ============================================================
// DROPDOWNS
// ============================================================
function populateCategoriesDropdown(selectId, selectedId = '') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecione uma categoria...</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.nome;
    if (cat.id === selectedId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function populateSuppliersDropdown(selectId, selectedId = '') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Sem fornecedor / Selecione...</option>';
  suppliers.forEach(sup => {
    const opt = document.createElement('option');
    opt.value = sup.id;
    opt.textContent = sup.name;
    if (sup.id === selectedId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function populateProductsDropdown(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Escolha o produto...</option>';
  [...products].sort((a, b) => a.name.localeCompare(b.name)).forEach(prod => {
    const opt = document.createElement('option');
    opt.value = prod.id;
    opt.textContent = `${prod.name} (Qtd: ${prod.quantity})`;
    sel.appendChild(opt);
  });
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);
  const costValue = products.reduce((acc, p) => acc + (p.quantity * p.priceCost), 0);
  const saleValue = products.reduce((acc, p) => acc + (p.quantity * p.priceSell), 0);
  const lowStockItems = products.filter(p => p.quantity <= p.minQuantity);

  document.getElementById('kpi-total-items').textContent = totalItems;
  document.getElementById('kpi-cost-value').textContent = formatCurrency(costValue);
  document.getElementById('kpi-sale-value').textContent = formatCurrency(saleValue);
  document.getElementById('kpi-low-stock').textContent = lowStockItems.length;

  const badge = document.getElementById('badge-low-stock-count');
  badge.textContent = lowStockItems.length;
  badge.style.display = lowStockItems.length > 0 ? 'inline-flex' : 'none';
  badge.className = 'badge badge-danger';

  // Lista de alertas
  const alertList = document.getElementById('alert-items-list');
  if (lowStockItems.length === 0) {
    alertList.innerHTML = `<div class="alert-empty-state"><i class="fa-solid fa-circle-check"></i><p>Nenhum item com estoque baixo!</p></div>`;
  } else {
    alertList.innerHTML = '';
    [...lowStockItems].sort((a, b) => (a.quantity / (a.minQuantity || 1)) - (b.quantity / (b.minQuantity || 1))).forEach(item => {
      const div = document.createElement('div');
      div.className = 'alert-item';
      div.innerHTML = `
        <div class="alert-item-info">
          <span class="alert-item-name">${item.name}</span>
          <span class="alert-item-qty">Qtd: <strong>${item.quantity}</strong> / Min: ${item.minQuantity}</span>
        </div>
        <span class="alert-badge">${item.quantity === 0 ? 'Esgotado' : 'Repor'}</span>
      `;
      alertList.appendChild(div);
    });
  }

  // Últimas movimentações
  const tbody = document.getElementById('dashboard-recent-transactions-tbody');
  tbody.innerHTML = '';
  const recent = transactions.slice(0, 5);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Nenhuma movimentação registrada.</td></tr>`;
  } else {
    recent.forEach(tx => {
      const date = new Date(tx.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      const badge = tx.type === 'in'
        ? `<span class="badge badge-success"><i class="fa-solid fa-circle-arrow-down" style="margin-right:4px;"></i> Entrada</span>`
        : `<span class="badge badge-danger"><i class="fa-solid fa-circle-arrow-up" style="margin-right:4px;"></i> Saída</span>`;
      const cls = tx.type === 'in' ? 'trend-up' : 'trend-down';
      const pfx = tx.type === 'in' ? '+' : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${date}</td>
        <td><div style="font-weight:500;">${tx.productName}</div><div style="font-size:0.75rem;color:var(--text-muted);">${tx.productSku}</div></td>
        <td>${badge}</td>
        <td class="metric-subtext ${cls}" style="font-weight:600;">${pfx}${tx.quantity}</td>
        <td>${formatCurrency(tx.unitPrice)}</td>
        <td style="font-weight:500;">${formatCurrency(tx.totalValue)}</td>
        <td style="font-size:0.85rem;">${tx.reason}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderCategoryDonutChart();
}

function renderCategoryDonutChart() {
  const canvas = document.getElementById('category-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  canvas.width = w; canvas.height = h;
  ctx.clearRect(0, 0, w, h);

  const catData = {};
  products.forEach(p => { catData[p.category] = (catData[p.category] || 0) + p.quantity; });
  const cats = Object.keys(catData);
  const total = Object.values(catData).reduce((a, b) => a + b, 0);
  if (total === 0) {
    ctx.font = '14px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('Sem itens em estoque.', w / 2, h / 2);
    return;
  }

  const palette = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9', '#f43f5e'];
  let angle = -0.5 * Math.PI;
  const cx = w * 0.35, cy = h / 2;
  const r = Math.min(cx, cy) * 0.8;
  const t = r * 0.4;

  cats.forEach((cat, i) => {
    const pct = catData[cat] / total;
    const slice = pct * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.strokeStyle = palette[i % palette.length];
    ctx.lineWidth = t;
    ctx.lineCap = 'round';
    ctx.stroke();
    angle += slice;
  });

  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#131a2b';
  ctx.beginPath(); ctx.arc(cx, cy, r - t / 2 - 1, 0, 2 * Math.PI);
  ctx.fillStyle = bg; ctx.fill();

  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#fff';
  const textMuted = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94a3b8';
  ctx.font = 'bold 20px Outfit, sans-serif'; ctx.fillStyle = textPrimary;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 6);
  ctx.font = '500 11px Outfit, sans-serif'; ctx.fillStyle = textMuted;
  ctx.fillText('ITENS TOTAL', cx, cy + 12);

  let ly = 35; const lx = w * 0.68;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  cats.slice(0, 8).forEach((cat, i) => {
    const color = palette[i % palette.length];
    const pct = ((catData[cat] / total) * 100).toFixed(0);
    ctx.beginPath(); ctx.arc(lx, ly, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color; ctx.fill();
    ctx.font = '500 12px Outfit, sans-serif'; ctx.fillStyle = textPrimary;
    ctx.fillText(`${cat.length > 12 ? cat.substring(0, 10) + '...' : cat} (${pct}%)`, lx + 15, ly);
    ly += 22;
  });
}

// ============================================================
// PRODUTOS
// ============================================================
function renderProducts() {
  const search = document.getElementById('search-product-input').value.toLowerCase();
  const catVal = document.getElementById('filter-product-category').value;
  const statVal = document.getElementById('filter-product-status').value;

  updateCategoryFilterDropdown();

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search);
    const matchCat = catVal === 'all' || p.category === catVal;
    let matchStat = true;
    if (statVal === 'low') matchStat = p.quantity <= p.minQuantity && p.quantity > 0;
    if (statVal === 'out') matchStat = p.quantity === 0;
    if (statVal === 'normal') matchStat = p.quantity > p.minQuantity;
    return matchSearch && matchCat && matchStat;
  });

  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:30px;">Nenhum produto correspondente.</td></tr>`;
    return;
  }

  filtered.forEach(prod => {
    const minQty = prod.minQuantity || 1;
    const ratio = Math.min(prod.quantity / minQty, 2.5);
    let pct = (ratio / 2.5) * 100;
    if (prod.quantity === 0) pct = 0;

    let barColor = 'var(--success)', badgeClass = 'badge-success', badgeLabel = 'Disponível';
    if (prod.quantity === 0) { barColor = 'var(--danger)'; badgeClass = 'badge-danger'; badgeLabel = 'Esgotado'; }
    else if (prod.quantity <= minQty) { barColor = 'var(--warning)'; badgeClass = 'badge-warning'; badgeLabel = 'Baixo Estoque'; }

    const initials = prod.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="product-cell">
          <div class="product-icon-circle" style="background-color:${prod.color};">${initials}</div>
          <div>
            <div class="product-info-name">${prod.name}</div>
            <div class="product-info-sku">${prod.sku}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-info">${prod.category}</span></td>
      <td>
        <div class="stock-indicator">
          <span class="stock-indicator-text"><strong>${prod.quantity}</strong> un.</span>
          <div class="stock-bar-bg"><div class="stock-bar-fill" style="width:${pct}%;background-color:${barColor};"></div></div>
        </div>
      </td>
      <td>${formatCurrency(prod.priceCost)}</td>
      <td>${formatCurrency(prod.priceSell)}</td>
      <td>${prod.supplierName || '<span style="color:var(--text-muted);">Não vinculado</span>'}</td>
      <td>${prod.localizacao ? `<span style="font-family:monospace;font-size:0.85rem;">${prod.localizacao}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
      <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn edit"   onclick="editProduct('${prod.id}')"   title="Editar"><i class="fa-solid fa-pencil"></i></button>
          <button class="action-btn delete" onclick="deleteProduct('${prod.id}')" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCategoryFilterDropdown() {
  const filter = document.getElementById('filter-product-category');
  const current = filter.value;
  filter.innerHTML = '<option value="all">Todas as Categorias</option>';
  const cats = [...new Set(products.map(p => p.category))].sort();
  cats.forEach(cat => {
    if (!cat) return;
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    if (cat === current) opt.selected = true;
    filter.appendChild(opt);
  });
}

// Salvar produto (novo ou edição)
async function handleSaveProduct() {
  const id = document.getElementById('form-product-id').value;
  const name = document.getElementById('prod-name').value.trim();
  const sku = document.getElementById('prod-sku').value.trim().toUpperCase();
  const categoriaId = document.getElementById('prod-category-select').value;
  const priceCost = parseFloat(document.getElementById('prod-price-cost').value);
  const priceSell = parseFloat(document.getElementById('prod-price-sell').value);
  const minQty = parseInt(document.getElementById('prod-min-quantity').value);
  const supplierId = document.getElementById('prod-supplier').value || null;
  const description = document.getElementById('prod-desc').value.trim();
  const localizacao = document.getElementById('prod-location').value.trim();

  if (priceSell < priceCost) {
    if (!confirm('O Preço de Venda é menor que o Preço de Custo. Deseja continuar?')) return;
  }

  const colors = ['#6366f1', '#3b82f6', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#ef4444'];
  const cor = colors[Math.floor(Math.random() * colors.length)];

  showLoadingOverlay(true);
  try {
    if (id) {
      // EDIÇÃO
      const { error } = await db.from('produtos').update({
        nome: name,
        sku,
        categoria_id: categoriaId || null,
        preco_custo: priceCost,
        preco_venda: priceSell,
        quantidade_min: minQty,
        fornecedor_id: supplierId,
        descricao: description,
        localizacao,
        atualizado_em: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
      showToast('Sucesso', 'Produto editado com sucesso.', 'success');
    } else {
      // NOVO PRODUTO
      const initialQty = parseInt(document.getElementById('prod-quantity').value) || 0;

      const { data: inserted, error } = await db.from('produtos').insert({
        nome: name,
        sku,
        categoria_id: categoriaId || null,
        preco_custo: priceCost,
        preco_venda: priceSell,
        quantidade: 0,          // trigger cuida disso via movimentacao
        quantidade_min: minQty,
        fornecedor_id: supplierId,
        descricao: description,
        localizacao,
        cor,
      }).select().single();
      if (error) throw error;

      // Registrar estoque inicial como movimentação de entrada
      if (initialQty > 0) {
        await db.from('movimentacoes').insert({
          produto_id: inserted.id,
          tipo: 'in',
          quantidade: initialQty,
          estoque_antes: 0,
          estoque_depois: initialQty,
          valor_unitario: priceCost,
          valor_total: priceCost * initialQty,
          motivo: 'Cadastro inicial do produto',
        });
      }
      showToast('Sucesso', 'Novo produto cadastrado.', 'success');
    }

    await loadProducts();
    closeModal('modal-product');
    renderProducts();
  } catch (err) {
    console.error(err);
    showToast('Erro', err.message || 'Não foi possível salvar o produto.', 'danger');
  } finally {
    showLoadingOverlay(false);
  }
}

window.editProduct = async function (id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('modal-product-title').textContent = 'Editar Produto';
  document.getElementById('form-product-id').value = prod.id;
  document.getElementById('prod-name').value = prod.name;
  document.getElementById('prod-sku').value = prod.sku;
  document.getElementById('prod-price-cost').value = prod.priceCost;
  document.getElementById('prod-price-sell').value = prod.priceSell;
  document.getElementById('prod-min-quantity').value = prod.minQuantity;
  document.getElementById('prod-desc').value = prod.description;
  document.getElementById('prod-location').value = prod.localizacao || '';
  document.getElementById('initial-stock-group').style.display = 'none';

  populateCategoriesDropdown('prod-category-select', prod.categoriaId);
  populateSuppliersDropdown('prod-supplier', prod.supplierId);
  openModal('modal-product');
};

window.deleteProduct = async function (id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;
  if (!confirm(`Excluir o produto '${prod.name}'? O histórico de movimentações será mantido.`)) return;

  showLoadingOverlay(true);
  try {
    const { error } = await db.from('produtos').update({ ativo: false }).eq('id', id);
    if (error) throw error;
    await loadProducts();
    showToast('Excluído', `Produto '${prod.name}' removido.`, 'warning');
    renderProducts();
  } catch (err) {
    showToast('Erro', err.message, 'danger');
  } finally {
    showLoadingOverlay(false);
  }
};

// ============================================================
// MOVIMENTAÇÕES
// ============================================================
function renderTransactions() {
  const search = document.getElementById('search-transaction-input').value.toLowerCase();
  const typeVal = document.getElementById('filter-transaction-type').value;

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.productName.toLowerCase().includes(search) || tx.reason.toLowerCase().includes(search);
    const matchType = typeVal === 'all' || tx.type === typeVal;
    return matchSearch && matchType;
  });

  const tbody = document.getElementById('transactions-tbody');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px;">Nenhuma movimentação encontrada.</td></tr>`;
    return;
  }

  filtered.forEach(tx => {
    const date = new Date(tx.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    const badge = tx.type === 'in'
      ? `<span class="badge badge-success"><i class="fa-solid fa-circle-arrow-down" style="margin-right:4px;"></i> Entrada</span>`
      : `<span class="badge badge-danger"><i class="fa-solid fa-circle-arrow-up" style="margin-right:4px;"></i> Saída</span>`;
    const cls = tx.type === 'in' ? 'trend-up' : 'trend-down';
    const pfx = tx.type === 'in' ? '+' : '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${date}</td>
      <td><strong>${tx.productName}</strong></td>
      <td><span class="badge badge-info" style="font-family:monospace;">${tx.productSku}</span></td>
      <td>${badge}</td>
      <td class="metric-subtext ${cls}" style="font-weight:700;font-size:1rem;">${pfx}${tx.quantity}</td>
      <td>${formatCurrency(tx.unitPrice)}</td>
      <td style="font-weight:600;">${formatCurrency(tx.totalValue)}</td>
      <td>${tx.reason}</td>
    `;
    tbody.appendChild(tr);
  });
}

window.handleTxProductChange = function () {
  const prodId = document.getElementById('tx-product-select').value;
  const helper = document.getElementById('tx-unit-price-helper');
  const price = document.getElementById('tx-unit-price');
  const type = document.getElementById('tx-type-select').value;
  if (!prodId) { helper.textContent = 'Escolha um produto.'; price.value = ''; return; }
  const prod = products.find(p => p.id === prodId);
  if (prod) {
    helper.textContent = `Custo: ${formatCurrency(prod.priceCost)} | Venda: ${formatCurrency(prod.priceSell)}`;
    price.value = type === 'in' ? prod.priceCost : prod.priceSell;
  }
};

window.handleTxTypeChange = function () { window.handleTxProductChange(); };

async function handleSaveTransaction() {
  const productId = document.getElementById('tx-product-select').value;
  const type = document.getElementById('tx-type-select').value;
  const quantity = parseInt(document.getElementById('tx-quantity').value);
  let unitPrice = parseFloat(document.getElementById('tx-unit-price').value);
  const dateVal = document.getElementById('tx-date').value;
  const reason = document.getElementById('tx-reason').value.trim();

  const prod = products.find(p => p.id === productId);
  if (!prod) { showToast('Erro', 'Produto inválido.', 'danger'); return; }

  if (type === 'out' && prod.quantity < quantity) {
    showToast('Estoque Insuficiente', `Só há ${prod.quantity} unidades disponíveis.`, 'danger');
    return;
  }

  if (isNaN(unitPrice) || unitPrice <= 0) unitPrice = type === 'in' ? prod.priceCost : prod.priceSell;

  const estoqueAntes = prod.quantity;
  const estoqueDepois = type === 'in' ? estoqueAntes + quantity : estoqueAntes - quantity;

  showLoadingOverlay(true);
  try {
    const { error } = await db.from('movimentacoes').insert({
      produto_id: productId,
      tipo: type,
      quantidade: quantity,
      estoque_antes: estoqueAntes,
      estoque_depois: estoqueDepois,
      valor_unitario: unitPrice,
      valor_total: unitPrice * quantity,
      motivo: reason,
      data: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString(),
    });
    if (error) throw error;

    if (type === 'out' && estoqueDepois <= prod.minQuantity) {
      showToast('Alerta de Reposição', `Estoque de '${prod.name}' ficou baixo (${estoqueDepois} un).`, 'warning');
    } else {
      showToast('Sucesso', 'Movimentação registrada.', 'success');
    }

    await Promise.all([loadProducts(), loadTransactions()]);
    closeModal('modal-transaction');

    const active = document.querySelector('.view-pane.active')?.id;
    if (active === 'view-dashboard') renderDashboard();
    if (active === 'view-transactions') renderTransactions();
    if (active === 'view-products') renderProducts();
  } catch (err) {
    showToast('Erro', err.message, 'danger');
  } finally {
    showLoadingOverlay(false);
  }
}

// ============================================================
// FORNECEDORES
// ============================================================
function renderSuppliers() {
  const search = document.getElementById('search-supplier-input').value.toLowerCase();
  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search) ||
    s.contactName.toLowerCase().includes(search) ||
    s.document.includes(search)
  );

  const tbody = document.getElementById('suppliers-tbody');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">Nenhum fornecedor cadastrado.</td></tr>`;
    return;
  }

  filtered.forEach(sup => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${sup.name}</strong></td>
      <td>${sup.contactName || '<span style="color:var(--text-muted);">-</span>'}</td>
      <td><span style="font-family:monospace;">${sup.document}</span></td>
      <td>${sup.phone || '<span style="color:var(--text-muted);">-</span>'}</td>
      <td>${sup.email || '<span style="color:var(--text-muted);">-</span>'}</td>
      <td style="font-size:0.85rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${sup.address}">${sup.address || '<span style="color:var(--text-muted);">-</span>'}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn edit"   onclick="editSupplier('${sup.id}')"   title="Editar"><i class="fa-solid fa-pencil"></i></button>
          <button class="action-btn delete" onclick="deleteSupplier('${sup.id}')" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function handleSaveSupplier() {
  const id = document.getElementById('form-supplier-id').value;
  const nome = document.getElementById('sup-name').value.trim();
  const nomeContato = document.getElementById('sup-contact').value.trim();
  const documento = document.getElementById('sup-doc').value.trim();
  const telefone = document.getElementById('sup-phone').value.trim();
  const email = document.getElementById('sup-email').value.trim();
  const endereco = document.getElementById('sup-address').value.trim();

  showLoadingOverlay(true);
  try {
    if (id) {
      const { error } = await db.from('fornecedores').update({ nome, nome_contato: nomeContato, documento, telefone, email, endereco }).eq('id', id);
      if (error) throw error;
      showToast('Sucesso', 'Fornecedor editado.', 'success');
    } else {
      const { error } = await db.from('fornecedores').insert({ nome, nome_contato: nomeContato, documento, telefone, email, endereco });
      if (error) throw error;
      showToast('Sucesso', 'Fornecedor cadastrado.', 'success');
    }
    await loadSuppliers();
    closeModal('modal-supplier');
    renderSuppliers();
  } catch (err) {
    showToast('Erro', err.message, 'danger');
  } finally {
    showLoadingOverlay(false);
  }
}

window.editSupplier = function (id) {
  const sup = suppliers.find(s => s.id === id);
  if (!sup) return;
  document.getElementById('modal-supplier-title').textContent = 'Editar Fornecedor';
  document.getElementById('form-supplier-id').value = sup.id;
  document.getElementById('sup-name').value = sup.name;
  document.getElementById('sup-contact').value = sup.contactName || '';
  document.getElementById('sup-doc').value = sup.document;
  document.getElementById('sup-phone').value = sup.phone || '';
  document.getElementById('sup-email').value = sup.email || '';
  document.getElementById('sup-address').value = sup.address || '';
  openModal('modal-supplier');
};

window.deleteSupplier = async function (id) {
  const sup = suppliers.find(s => s.id === id);
  if (!sup) return;
  const linked = products.filter(p => p.supplierId === id);
  let msg = `Excluir fornecedor '${sup.name}'?`;
  if (linked.length > 0) msg = `${linked.length} produto(s) vinculado(s) perderão o vínculo. ${msg}`;
  if (!confirm(msg)) return;
  showLoadingOverlay(true);
  try {
    const { error } = await db.from('fornecedores').delete().eq('id', id);
    if (error) throw error;
    await Promise.all([loadSuppliers(), loadProducts()]);
    showToast('Excluído', `Fornecedor '${sup.name}' removido.`, 'warning');
    renderSuppliers();
  } catch (err) {
    showToast('Erro', err.message, 'danger');
  } finally {
    showLoadingOverlay(false);
  }
};
// ============================================================
// CATEGORIAS
// ============================================================
function renderCategories() {
  const search = document.getElementById('search-category-input').value.toLowerCase();
  const filtered = categories.filter(c => c.nome.toLowerCase().includes(search));

  const tbody = document.getElementById('categories-tbody');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" style="text-align:center;color:var(--text-muted);padding:30px;">Nenhuma categoria encontrada.</td></tr>`;
    return;
  }

  filtered.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${cat.nome}</strong></td>
      <td>
        <div class="table-actions">
          <button class="action-btn edit"   onclick="editCategory('${cat.id}')"   title="Editar"><i class="fa-solid fa-pencil"></i></button>
          <button class="action-btn delete" onclick="deleteCategory('${cat.id}')" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function handleSaveCategory() {
  const id = document.getElementById('form-category-id').value;
  const name = document.getElementById('cat-name').value.trim();
  const callbackSelectId = document.getElementById('form-category-callback').value;

  if (!name) {
    showToast('Erro', 'O nome da categoria é obrigatório.', 'danger');
    return;
  }

  showLoadingOverlay(true);
  try {
    let savedId = id;
    if (id) {
      const { error } = await db.from('categorias').update({ nome: name }).eq('id', id);
      if (error) throw error;
      showToast('Sucesso', 'Categoria editada.', 'success');
    } else {
      const { data, error } = await db.from('categorias').insert({ nome: name }).select().single();
      if (error) throw error;
      savedId = data.id;
      showToast('Sucesso', 'Categoria cadastrada.', 'success');
    }
    
    await loadCategories();
    closeModal('modal-category');

    // Se veio do atalho de criação rápida, seleciona a categoria recém-criada
    if (callbackSelectId) {
      populateCategoriesDropdown(callbackSelectId, savedId);
    }

    const active = document.querySelector('.view-pane.active')?.id;
    if (active === 'view-categories') renderCategories();
    if (active === 'view-products') renderProducts();
  } catch (err) {
    showToast('Erro', err.message || 'Erro ao salvar a categoria.', 'danger');
  } finally {
    showLoadingOverlay(false);
  }
}

window.editCategory = function (id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  document.getElementById('modal-category-title').textContent = 'Editar Categoria';
  document.getElementById('form-category-id').value = cat.id;
  document.getElementById('form-category-callback').value = '';
  document.getElementById('cat-name').value = cat.nome;
  openModal('modal-category');
};

window.deleteCategory = async function (id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  
  // Como temos ON DELETE SET NULL, os produtos associados perderão o vínculo
  const linked = products.filter(p => p.categoriaId === id);
  let msg = `Excluir a categoria '${cat.nome}'?`;
  if (linked.length > 0) {
    msg = `${linked.length} produto(s) vinculado(s) terão a categoria alterada para "Outros". ${msg}`;
  }
  
  if (!confirm(msg)) return;

  showLoadingOverlay(true);
  try {
    const { error } = await db.from('categorias').delete().eq('id', id);
    if (error) throw error;
    
    showToast('Excluído', `Categoria '${cat.nome}' removida.`, 'warning');
    await Promise.all([loadCategories(), loadProducts()]);
    
    const active = document.querySelector('.view-pane.active')?.id;
    if (active === 'view-categories') renderCategories();
    if (active === 'view-products') renderProducts();
  } catch (err) {
    showToast('Erro', err.message || 'Erro ao excluir a categoria.', 'danger');
  } finally {
    showLoadingOverlay(false);
  }
};

window.handleSaveCategory = handleSaveCategory;

// ============================================================
// CONFIGURAÇÕES
// ============================================================
function renderSettings() {
  document.getElementById('settings-company-name').value = settings.companyName || '';
  document.getElementById('settings-currency').value = settings.currency || 'R$';
}

async function saveCompanySettings() {
  const name = document.getElementById('settings-company-name').value.trim();
  const currency = document.getElementById('settings-currency').value;
  if (!name) { showToast('Campo obrigatório', 'Insira o nome da empresa.', 'warning'); return; }
  showLoadingOverlay(true);
  try {
    const { error } = await db.from('settings').update({ company_name: name, currency }).eq('id', 1);
    if (error) throw error;
    settings.companyName = name;
    settings.currency = currency;
    showToast('Sucesso', 'Configurações salvas.', 'success');
    if (document.getElementById('view-dashboard').classList.contains('active')) renderDashboard();
  } catch (err) {
    showToast('Erro', err.message, 'danger');
  } finally {
    showLoadingOverlay(false);
  }
}

async function exportData() {
  await loadAll();
  const backup = { products, suppliers, transactions, settings, exportDate: new Date().toISOString() };
  const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const a = document.createElement('a');
  a.href = url;
  a.download = `jc_estoque_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  showToast('Exportação', 'Backup JSON gerado.', 'success');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (parsed.products && parsed.suppliers) {
        showToast('Importação', 'Para restaurar dados no Supabase, importe via painel do Supabase ou contate o suporte.', 'warning');
      } else {
        showToast('Erro', 'Formato de arquivo inválido.', 'danger');
      }
    } catch { showToast('Erro', 'JSON inválido.', 'danger'); }
  };
  reader.readAsText(file);
}

async function resetDatabase() {
  if (!confirm('ATENÇÃO: Isso apagará TODOS os dados do servidor permanentemente. Tem certeza?')) return;
  if (!confirm('Segunda confirmação: esta ação é IRREVERSÍVEL. Continuar?')) return;
  showLoadingOverlay(true);
  try {
    await db.from('movimentacoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.from('produtos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.from('fornecedores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    showToast('Banco resetado', 'Todos os dados foram removidos.', 'danger');
    await loadAll();
    renderDashboard();
  } catch (err) {
    showToast('Erro', err.message, 'danger');
  } finally {
    showLoadingOverlay(false);
  }
}
