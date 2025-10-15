import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
});

export const markdownToHtml = (markdown: string) => {
  return md.render(markdown);
};
