// Remark-plugin voor blogmarkdown:
// haalt de eerste H1 weg (de paginatitel komt uit de frontmatter).
// Links naar /aanvraag en /en/request blijven staan: die pagina's zijn het formulier.
export default function remarkBlog() {
  return (tree, file) => {
    const p = String(file?.path || file?.history?.[0] || '');
    if (!/[\\/]content[\\/]blog(-print)?[\\/]/.test(p)) return;
    const i = tree.children.findIndex((n) => n.type === 'heading' && n.depth === 1);
    if (i !== -1 && !/blog-print/.test(p)) tree.children.splice(i, 1);
  };
}
