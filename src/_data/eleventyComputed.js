module.exports = {
  pageSlug: (data) => {
    const slug = data.page.fileSlug;
    // For index.njk, Eleventy uses the parent dir name as fileSlug
    if (slug === data.lang) return "index";
    return slug;
  }
};
