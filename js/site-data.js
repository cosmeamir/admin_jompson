(function () {
  const DATA_URL = 'data/site-data.json';

  fetch(DATA_URL, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Não foi possível carregar os dados do site.');
      }
      return response.json();
    })
    .then((data) => {
      if (!data) return;
      renderStats(data.stats || {});
      renderHomeBlog(data.blogs || []);
      renderBlogList(data.blogs || []);
      renderSingleBlog(data.blogs || []);
      renderFooterBlog(data.blogs || []);
      renderSidebarBlog(data.blogs || []);
    })
    .catch((error) => {
      console.error(error);
    });

  function renderStats(stats) {
    if (!stats) return;
    const formatter = new Intl.NumberFormat('pt-PT');
    document.querySelectorAll('[data-stat]').forEach((element) => {
      const key = element.getAttribute('data-stat');
      const value = typeof stats[key] !== 'undefined' ? Number(stats[key]) : null;
      if (value === null || Number.isNaN(value)) return;
      element.setAttribute('data-number', String(value));
      element.textContent = formatter.format(value);
    });
  }

  function renderHomeBlog(blogs) {
    const container = document.getElementById('home-blog-list');
    const emptyState = document.getElementById('home-blog-empty');
    if (!container) return;
    container.innerHTML = '';
    if (!blogs.length) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    blogs.slice(0, 3).forEach((post) => {
      container.appendChild(createBlogCard(post));
    });
    if (emptyState) emptyState.style.display = 'none';
  }

  function renderBlogList(blogs) {
    const list = document.getElementById('blog-list');
    const empty = document.getElementById('blog-empty');
    if (!list) return;
    list.innerHTML = '';
    if (!blogs.length) {
      if (empty) empty.style.display = 'block';
      return;
    }
    blogs.forEach((post) => {
      list.appendChild(createBlogCard(post, { showExcerpt: true }));
    });
    if (empty) empty.style.display = 'none';
  }

  function renderSingleBlog(blogs) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const singleContainer = document.getElementById('single-blog');
    const titleEl = document.getElementById('single-title');
    const metaEl = document.getElementById('single-meta');
    const contentEl = document.getElementById('single-content');
    const heroTitle = document.getElementById('single-hero-title');
    const breadcrumbTitle = document.getElementById('single-breadcrumb-title');
    const imageWrapper = document.getElementById('single-image-wrapper');
    const imageEl = document.getElementById('single-image');
    const notFound = document.getElementById('single-not-found');

    if (!singleContainer || !titleEl || !metaEl || !contentEl) return;

    const post = blogs.find((item) => item.slug === slug) || null;
    if (!post) {
      if (notFound) notFound.style.display = 'block';
      singleContainer.style.display = 'none';
      if (heroTitle) heroTitle.textContent = 'Blog';
      if (breadcrumbTitle) breadcrumbTitle.textContent = 'Artigo não encontrado';
      return;
    }

    if (notFound) notFound.style.display = 'none';
    singleContainer.style.display = 'block';
    titleEl.textContent = post.title;
    if (heroTitle) heroTitle.textContent = post.title;
    if (breadcrumbTitle) breadcrumbTitle.textContent = post.title;
    metaEl.textContent = `${formatDate(post.date)} · ${post.author}`;

    if (post.image && imageEl && imageWrapper) {
      imageEl.src = post.image;
      imageEl.alt = post.title;
      imageWrapper.style.display = 'block';
    } else if (imageWrapper) {
      imageWrapper.style.display = 'none';
    }

    contentEl.innerHTML = formatContent(post.content);
  }

  function renderFooterBlog(blogs) {
    const footerContainer = document.getElementById('footer-blog-list');
    if (!footerContainer) return;
    footerContainer.innerHTML = '';
    blogs.slice(0, 2).forEach((post) => {
      footerContainer.appendChild(createFooterItem(post));
    });
  }

  function renderSidebarBlog(blogs) {
    const sidebarContainer = document.getElementById('sidebar-blog-list');
    if (!sidebarContainer) return;
    sidebarContainer.innerHTML = '';
    blogs.slice(0, 3).forEach((post) => {
      sidebarContainer.appendChild(createSidebarItem(post));
    });
  }

  function createBlogCard(post, options) {
    const showExcerpt = options && options.showExcerpt;
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 ftco-animate';

    const entry = document.createElement('div');
    entry.className = 'blog-entry';

    const link = document.createElement('a');
    link.className = 'block-20 d-flex align-items-end';
    link.href = `blog-single.html?slug=${encodeURIComponent(post.slug)}`;
    if (post.image) {
      link.style.backgroundImage = `url('${post.image}')`;
    }

    const meta = document.createElement('div');
    meta.className = 'meta-date text-center p-2';
    const dateParts = getDateParts(post.date);
    meta.innerHTML = `
      <span class="day">${dateParts.day}</span>
      <span class="mos">${dateParts.month}</span>
      <span class="yr">${dateParts.year}</span>
    `;

    link.appendChild(meta);

    const text = document.createElement('div');
    text.className = 'text bg-white p-4';

    const heading = document.createElement('h3');
    heading.className = 'heading';
    const headingLink = document.createElement('a');
    headingLink.href = link.href;
    headingLink.textContent = post.title;
    heading.appendChild(headingLink);

    text.appendChild(heading);

    if (showExcerpt) {
      const paragraph = document.createElement('p');
      paragraph.textContent = post.excerpt;
      text.appendChild(paragraph);
    }

    const footer = document.createElement('div');
    footer.className = 'd-flex align-items-center mt-4';

    const more = document.createElement('p');
    more.className = 'mb-0';
    const moreLink = document.createElement('a');
    moreLink.className = 'btn btn-primary';
    moreLink.href = link.href;
    moreLink.innerHTML = 'Saber Mais<span class="ion-ios-arrow-round-forward"></span>';
    more.appendChild(moreLink);

    const metaInfo = document.createElement('p');
    metaInfo.className = 'ml-auto mb-0';
    metaInfo.innerHTML = `
      <a href="${link.href}" class="mr-2">${post.author}</a>
      <span class="text-muted">${formatDate(post.date)}</span>
    `;

    footer.appendChild(more);
    footer.appendChild(metaInfo);

    text.appendChild(footer);

    entry.appendChild(link);
    entry.appendChild(text);
    col.appendChild(entry);
    return col;
  }

  function createFooterItem(post) {
    const wrapper = document.createElement('div');
    wrapper.className = 'block-21 mb-4 d-flex';

    const imageLink = document.createElement('a');
    imageLink.className = 'blog-img mr-4';
    imageLink.href = `blog-single.html?slug=${encodeURIComponent(post.slug)}`;
    if (post.image) {
      imageLink.style.backgroundImage = `url(${post.image})`;
    }

    const text = document.createElement('div');
    text.className = 'text';

    const heading = document.createElement('h3');
    heading.className = 'heading';
    const link = document.createElement('a');
    link.href = imageLink.href;
    link.textContent = post.title;
    heading.appendChild(link);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
      <div><a href="${link.href}"><span class="icon-calendar"></span> ${formatDate(post.date)}</a></div>
      <div><a href="${link.href}"><span class="icon-person"></span> ${post.author}</a></div>
    `;

    text.appendChild(heading);
    text.appendChild(meta);

    wrapper.appendChild(imageLink);
    wrapper.appendChild(text);
    return wrapper;
  }

  function createSidebarItem(post) {
    const wrapper = document.createElement('div');
    wrapper.className = 'block-21 mb-4 d-flex';

    const imageLink = document.createElement('a');
    imageLink.className = 'blog-img mr-4';
    imageLink.href = `blog-single.html?slug=${encodeURIComponent(post.slug)}`;
    if (post.image) {
      imageLink.style.backgroundImage = `url(${post.image})`;
    }

    const text = document.createElement('div');
    text.className = 'text';

    const heading = document.createElement('h3');
    heading.className = 'heading';
    const link = document.createElement('a');
    link.href = imageLink.href;
    link.textContent = post.title;
    heading.appendChild(link);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `
      <div><a href="${link.href}"><span class="icon-calendar"></span> ${formatDate(post.date)}</a></div>
      <div><a href="${link.href}"><span class="icon-person"></span> ${post.author}</a></div>
    `;

    text.appendChild(heading);
    text.appendChild(meta);

    wrapper.appendChild(imageLink);
    wrapper.appendChild(text);
    return wrapper;
  }

  function getDateParts(dateString) {
    const date = new Date(dateString || '');
    if (Number.isNaN(date.getTime())) {
      return { day: '--', month: '--', year: '' };
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = capitalize(date.toLocaleString('pt-PT', { month: 'short' }));
    const year = String(date.getFullYear());
    return { day, month, year };
  }

  function formatDate(dateString) {
    const date = new Date(dateString || '');
    if (Number.isNaN(date.getTime())) {
      return dateString || '';
    }
    return capitalize(new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date));
  }

  function formatContent(text) {
    if (!text) return '';
    return text
      .split(/\n\s*\n/)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function capitalize(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
})();
