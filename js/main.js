(()=> {
  console.time('OnAPILoaded');
  console.time('OnPageLoad');
  console.time('OnPageLoaded');

  window.ec = window.ec || {};
  window.ec.config = window.ec.config || {};
  window.ec.config.storefrontUrls = window.ec.config.storefrontUrls || {};
  window.ec.config.storefrontUrls.cleanUrls = true;
  window.ec.config.baseUrl = '/';

  window.ec.storefront = window.ec.storefront || {};
  window.ec.storefront.show_footer_menu = false;

  window.ecwid_script_defer = true;
  window.ecwid_dynamic_widgets = true;

  window.pageDetected = false;

  Ecwid.OnAPILoaded.add(() => {
    console.log('OnAPILoaded');
    const page = Ecwid.Controller.getCurrentPage();
    console.log('page.type', page.type)

    if(!window.pageDetected) {
      console.timeEnd('OnAPILoaded');
      window.pageDetected = true;
      const header = document.querySelector('#header');
      const pageHolder = document.querySelector('#content');

      const storeId = Ecwid.getOwnerId();
      const token = Ecwid.publicToken;
      const api = getApi(storeId, token);

      console.log(storeId, token);

      switch (page.type) {
        case 'PRODUCT':
          renderProductPage(pageHolder, api, page.productId);
          break;
        case 'CATEGORY':
          renderCategoryPage(pageHolder, api, page.categoryId);
          break;
        case 'CART':
          if (typeof Ecwid != 'undefined') Ecwid.destroy();
          window._xnext_initialization_scripts = [{
            widgetType: 'ProductBrowser',
            id: 'content',
            arg: ["id=productBrowser"]
          }];
          window.ecwid_onBodyDone();
          break;
      }
    }

  });

  Ecwid.OnPageLoad.add((page) => {
    console.timeEnd('OnPageLoad');
  });

  Ecwid.OnPageLoaded.add((page) => {
    console.timeEnd('OnPageLoaded');
  });
})()

function getApi(storeId, token) {
  return {
    getCategoryProducts(catId) {
      return fetch(`https://app.ecwid.com/api/v3/${storeId}/products?token=${token}&category=${catId}`)
        .then(resp => resp.json());
    },

    getProduct(pId) {
      return fetch(`https://app.ecwid.com/api/v3/${storeId}/products/${pId}?token=${token}`)
        .then(resp => resp.json());
    }
  }
}

function renderCategoryPage(pageHolder, api, catId) {
  console.log('renderCategory', catId);

  return api.getCategoryProducts(catId)
    .then((data) => {
      console.log(data.items);
      const categoryWidget = document.createElement('div');
      categoryWidget.setAttribute('class', 'category-widget');

      data.items.forEach((p) => {
        const productItem = document.createElement('div');
        productItem.setAttribute('class', 'product-item');
        productItem.addEventListener('click', () => {
          console.log('click product', p.id);
          window.location.href = parseURL(p.url).pathname;
        })

        const productImage = document.createElement('img');
        productImage.setAttribute('src', p.thumbnailUrl);
        productItem.appendChild(productImage);

        categoryWidget.appendChild(productItem)
      })

      pageHolder.appendChild(categoryWidget);
    })
    .catch(e => {
      console.log(e);
      const noResult = document.createElement('div');
      noResult.innerText = 'No products';
      pageHolder.appendChild(noResult);
    });
}

function renderProductPage(pageHolder, api, pid) {
  console.log('renderProduct', pid);

  if (typeof Ecwid != 'undefined') Ecwid.destroy();
  window._xnext_initialization_scripts = [{
    widgetType: 'ProductBrowser',
    id: 'content',
    arg: ["id=productBrowser"]
  }];

  window.ecwid_onBodyDone();

}

function parseURL(url) {
  var parser = document.createElement('a'),
    searchObject = {},
    queries, split, i;
  // Let the browser do the work
  parser.href = url;
  // Convert query string to object
  queries = parser.search.replace(/^\?/, '').split('&');
  for( i = 0; i < queries.length; i++ ) {
    split = queries[i].split('=');
    searchObject[split[0]] = split[1];
  }
  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    searchObject: searchObject,
    hash: parser.hash
  };
}

