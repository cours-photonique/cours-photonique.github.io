/* Configuration de MathJax (chargé depuis assets/vendor/mathjax, aucun service externe).
   Les macros évitent de réécrire les indices fréquents : \neff, \nsub, \nsup, \asub… */
window.MathJax = {
  tex: {
    inlineMath: [['$', '$']], displayMath: [['$$', '$$']],
    macros: {
      vE: '\\vec{E}', vH: '\\vec{H}', vD: '\\vec{D}', vB: '\\vec{B}', vP: '\\vec{P}',
      neff: 'n_{\\text{eff}}', nsub: 'n_{\\text{sub}}', nsup: 'n_{\\text{sup}}',
      asub: '\\alpha_{\\text{sub}}', asup: '\\alpha_{\\text{sup}}',
      Asub: 'A_{\\text{sub}}', Asup: 'A_{\\text{sup}}', Bsub: 'B_{\\text{sub}}', Bsup: 'B_{\\text{sup}}',
      nslab: 'n_{\\text{slab}}', dd: '\\mathrm{d}', Re: '\\operatorname{Re}'
    }
  },
  svg: { fontCache: 'global' },
  options: { ignoreHtmlClass: 'mj-ignore' }
};
