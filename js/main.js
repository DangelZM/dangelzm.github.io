(()=> {
  console.time('OnAPILoaded');
  console.time('OnPageLoad');

  Ecwid.OnAPILoaded.add(function() {
    console.timeEnd('OnAPILoaded');
  });

  Ecwid.OnPageLoad.add((page) => {
    console.timeEnd('OnPageLoad');
  });
})()