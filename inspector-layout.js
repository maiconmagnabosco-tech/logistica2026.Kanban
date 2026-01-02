// Script para inspecionar layout no DevTools
// Cole este código no Console do DevTools (F12)

(function() {
  const sidebar = document.querySelector('.sidebar');
  const mainWrapper = document.querySelector('.main-wrapper');
  const board = document.querySelector('.board');
  const columns = document.querySelectorAll('.column');
  
  if (!sidebar || !mainWrapper || !board) {
    console.error('Elementos não encontrados:', {
      sidebar: !!sidebar,
      mainWrapper: !!mainWrapper,
      board: !!board
    });
    return;
  }
  
  const sidebarStyle = window.getComputedStyle(sidebar);
  const mainWrapperStyle = window.getComputedStyle(mainWrapper);
  const boardStyle = window.getComputedStyle(board);
  
  const info = {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    sidebar: {
      width: sidebarStyle.width,
      offsetWidth: sidebar.offsetWidth,
      marginLeft: sidebarStyle.marginLeft,
      marginRight: sidebarStyle.marginRight,
      paddingLeft: sidebarStyle.paddingLeft,
      paddingRight: sidebarStyle.paddingRight,
      borderRight: sidebarStyle.borderRight,
      boxSizing: sidebarStyle.boxSizing,
      position: sidebarStyle.position,
      left: sidebarStyle.left,
      getBoundingClientRect: sidebar.getBoundingClientRect()
    },
    mainWrapper: {
      width: mainWrapperStyle.width,
      offsetWidth: mainWrapper.offsetWidth,
      marginLeft: mainWrapperStyle.marginLeft,
      marginRight: mainWrapperStyle.marginRight,
      paddingLeft: mainWrapperStyle.paddingLeft,
      paddingRight: mainWrapperStyle.paddingRight,
      boxSizing: mainWrapperStyle.boxSizing,
      offsetLeft: mainWrapper.offsetLeft,
      getBoundingClientRect: mainWrapper.getBoundingClientRect()
    },
    board: {
      width: boardStyle.width,
      offsetWidth: board.offsetWidth,
      paddingLeft: boardStyle.paddingLeft,
      paddingRight: boardStyle.paddingRight,
      marginLeft: boardStyle.marginLeft,
      marginRight: boardStyle.marginRight,
      gridTemplateColumns: boardStyle.gridTemplateColumns,
      gap: boardStyle.gap,
      boxSizing: boardStyle.boxSizing,
      getBoundingClientRect: board.getBoundingClientRect()
    },
    columns: Array.from(columns).map((col, idx) => {
      const colStyle = window.getComputedStyle(col);
      return {
        index: idx,
        width: colStyle.width,
        offsetWidth: col.offsetWidth,
        minWidth: colStyle.minWidth,
        maxWidth: colStyle.maxWidth,
        boxSizing: colStyle.boxSizing,
        getBoundingClientRect: col.getBoundingClientRect()
      };
    }),
    calculos: {
      sidebarTotalWidth: sidebar.offsetWidth,
      mainWrapperStart: mainWrapper.offsetLeft,
      mainWrapperWidth: mainWrapper.offsetWidth,
      boardWidth: board.offsetWidth,
      totalUsed: sidebar.offsetWidth + mainWrapper.offsetLeft + mainWrapper.offsetWidth,
      expectedMainWrapperWidth: window.innerWidth - sidebar.offsetWidth,
      difference: (window.innerWidth - sidebar.offsetWidth) - mainWrapper.offsetWidth
    }
  };
  
  console.log('=== INSPEÇÃO DE LAYOUT ===');
  console.log('Viewport:', info.viewport);
  console.log('Sidebar:', info.sidebar);
  console.log('Main Wrapper:', info.mainWrapper);
  console.log('Board:', info.board);
  console.log('Columns:', info.columns);
  console.log('Cálculos:', info.calculos);
  console.log('');
  console.log('RESUMO:');
  console.log(`Sidebar ocupa: ${info.sidebar.offsetWidth}px`);
  console.log(`Main-wrapper começa em: ${info.mainWrapper.offsetLeft}px`);
  console.log(`Main-wrapper largura: ${info.mainWrapper.offsetWidth}px`);
  console.log(`Board largura: ${info.board.offsetWidth}px`);
  console.log(`Total usado: ${info.calculos.totalUsed}px`);
  console.log(`Viewport width: ${info.viewport.width}px`);
  console.log(`Diferença: ${info.calculos.difference}px`);
  console.log(`Largura esperada main-wrapper: ${info.calculos.expectedMainWrapperWidth}px`);
  console.log('');
  console.log('Colunas:');
  info.columns.forEach((col, idx) => {
    console.log(`  Coluna ${idx + 1}: ${col.offsetWidth}px (${((col.offsetWidth / info.board.offsetWidth) * 100).toFixed(2)}%)`);
  });
  
  return info;
})();




