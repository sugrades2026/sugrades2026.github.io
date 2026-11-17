/* Initialize planning calculators after their standalone modules have loaded. */
(() => {
  'use strict';
  if (typeof window.suAcademicInit === 'function') window.suAcademicInit(document.getElementById('academic-tools'));
  if (typeof window.suFinalInit === 'function') window.suFinalInit(document.getElementById('final-tools'));
  if (typeof window.suPlanningPersistenceInit === 'function') window.suPlanningPersistenceInit(document.getElementById('planning'));
})();
