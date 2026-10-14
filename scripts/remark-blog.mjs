// Remark-plugin voor blogmarkdown:
// - haalt de eerste H1 weg (de paginatitel komt uit de frontmatter)
// - zet placeholder-links naar het aanvraagformulier om naar de echte URL's
const FORM = { '/aanvraag': '/#aanvraag', '/aanvraag/': '/#aanvraag', '/en/request': '/en/#aanvraag', '/en/request/': '/en/#aanvraag' };
function walk(node, fn) { fn(node); (node.children || []).forEach((c) => walk(c, fn)); }
export default function remarkBlog() {
  return (tree, file) => {
    const p = String(file?.path || file?.history?.[0] || '');
    if (!/[\\/]content[\\/]blog(-print)?[\\/]/.test(p)) return;
    const i = tree.children.findIndex((n) => n.type === 'heading' && n.depth === 1);
    if (i !== -1 && !/blog-print/.test(p)) tree.children.splice(i, 1);
    walk(tree, (n) => { if (n.type === 'link' && FORM[n.url]) n.url = FORM[n.url]; });
  };
}
